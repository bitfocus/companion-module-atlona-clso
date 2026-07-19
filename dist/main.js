import { InstanceBase, InstanceStatus, runEntrypoint, TelnetHelper, } from '@companion-module/base';
import { GetConfigFields } from './config.js';
import { UpdateVariableDefinitions, NUM_INPUTS, NUM_OUTPUTS } from './variables.js';
import { UpgradeScripts } from './upgrades.js';
import { UpdateActions } from './actions.js';
import { UpdateFeedbacks } from './feedbacks.js';
import { UpdatePresets } from './presets.js';
export default class ModuleInstance extends InstanceBase {
    constructor(internal) {
        super(internal);
        // Internal state
        this.powerStatus = '';
        this.inputStatuses = new Array(NUM_INPUTS).fill('0');
        this.outputRoutings = new Array(NUM_OUTPUTS).fill('');
        this.telnet = null;
        this.receiveBuffer = '';
    }
    async init(config) {
        this.config = config;
        this.updateStatus(InstanceStatus.Disconnected);
        this.updateActions();
        this.updateFeedbacks();
        this.updatePresets();
        this.updateVariableDefinitions();
        this.initVariables();
        this.connectTelnet();
    }
    async destroy() {
        if (this.telnet) {
            this.telnet.destroy();
            this.telnet = null;
        }
        this.log('debug', 'destroy');
    }
    async configUpdated(config) {
        this.config = config;
        if (this.telnet) {
            this.telnet.destroy();
            this.telnet = null;
        }
        this.connectTelnet();
    }
    getConfigFields() {
        return GetConfigFields();
    }
    // ── Telnet Connection ─────────────────────────────────────────────────────
    connectTelnet() {
        if (!this.config.host) {
            this.updateStatus(InstanceStatus.BadConfig, 'No IP address configured');
            return;
        }
        this.updateStatus(InstanceStatus.Connecting);
        this.telnet = new TelnetHelper(this.config.host, this.config.port, {
            reconnect: true,
            reconnect_interval: 5000,
        });
        this.telnet.on('connect', () => {
            this.log('debug', 'Telnet connected');
            this.updateStatus(InstanceStatus.Ok);
            this.receiveBuffer = '';
            // Query current state on connection
            this.queryAllStatus();
        });
        this.telnet.on('data', (data) => {
            this.receiveBuffer += data.toString();
            this.processBuffer();
        });
        this.telnet.on('error', (err) => {
            this.log('error', `Telnet error: ${err.message}`);
            this.updateStatus(InstanceStatus.ConnectionFailure, err.message);
        });
        this.telnet.on('end', () => {
            this.log('debug', 'Telnet connection ended');
            this.updateStatus(InstanceStatus.Disconnected);
        });
        this.telnet.on('status_change', (status, message) => {
            this.updateStatus(status, message);
        });
        this.telnet.connect();
    }
    // ── Data Parsing ──────────────────────────────────────────────────────────
    processBuffer() {
        const lines = this.receiveBuffer.split(/\r?\n/);
        // Keep the last incomplete line in the buffer
        this.receiveBuffer = lines.pop() ?? '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
                this.handleResponse(trimmed);
            }
        }
    }
    handleResponse(response) {
        this.log('debug', `Received: ${response}`);
        // Power status: "PWON" or "PWOFF"
        if (response === 'PWON' || response === 'PWOFF') {
            this.powerStatus = response;
            this.setVariableValues({ power_status: response });
            this.checkFeedbacks('power_on', 'power_off');
            return;
        }
        // Input status: "InputStatus 00000000"
        const inputStatusMatch = response.match(/^InputStatus\s+([01]{8})$/);
        if (inputStatusMatch) {
            const statusStr = inputStatusMatch[1];
            for (let i = 0; i < NUM_INPUTS; i++) {
                this.inputStatuses[i] = statusStr[i] ?? '0';
            }
            const values = {};
            for (let i = 0; i < NUM_INPUTS; i++) {
                values[`input_${i + 1}_status`] = this.inputStatuses[i] ?? '0';
            }
            this.setVariableValues(values);
            this.checkFeedbacks('input_signal');
            return;
        }
        // Routing status: "x2AVx1,x2AVx2,x3AVx3,x4AVx4"
        // Each token xNAVxM means input N is routed to output M
        if (/^x\d+AVx\d/.test(response)) {
            this.parseRoutingStatus(response);
            return;
        }
    }
    /**
     * Parse routing status string like "x2AVx1,x2AVx2,x3AVx3,x4AVx4"
     * Sets outputRoutings[output-1] = inputNumber
     */
    parseRoutingStatus(status) {
        // Reset all outputs
        this.outputRoutings = new Array(NUM_OUTPUTS).fill('');
        const tokens = status.split(',');
        for (const token of tokens) {
            const match = token.trim().match(/^x(\d+)AVx(\d+)$/);
            if (match) {
                const input = parseInt(match[1], 10);
                const output = parseInt(match[2], 10);
                if (output >= 1 && output <= NUM_OUTPUTS) {
                    this.outputRoutings[output - 1] = String(input);
                }
            }
        }
        const values = {};
        for (let i = 0; i < NUM_OUTPUTS; i++) {
            values[`output_${i + 1}_routing`] = this.outputRoutings[i] ?? '';
        }
        this.setVariableValues(values);
        this.checkFeedbacks('output_routing');
    }
    // ── Commands ──────────────────────────────────────────────────────────────
    async sendCommand(command) {
        if (!this.telnet || !this.telnet.isConnected) {
            this.log('warn', `Cannot send command "${command}" — not connected`);
            return;
        }
        this.log('debug', `Sending: ${command}`);
        await this.telnet.send(`${command}\r\n`);
    }
    queryAllStatus() {
        // Use a small delay between queries to avoid flooding the device
        const queries = ['PWSTA', 'InputStatus', 'Status'];
        let delay = 0;
        for (const query of queries) {
            setTimeout(() => {
                this.sendCommand(query).catch((err) => {
                    this.log('error', `Failed to send query ${query}: ${String(err)}`);
                });
            }, delay);
            delay += 200;
        }
    }
    // ── Internal helpers ──────────────────────────────────────────────────────
    initVariables() {
        const values = {
            power_status: '',
        };
        for (let i = 1; i <= NUM_INPUTS; i++) {
            values[`input_${i}_status`] = '0';
        }
        for (let i = 1; i <= NUM_OUTPUTS; i++) {
            values[`output_${i}_routing`] = '';
        }
        this.setVariableValues(values);
    }
    // ── Delegate update methods ───────────────────────────────────────────────
    updateActions() {
        UpdateActions(this);
    }
    updateFeedbacks() {
        UpdateFeedbacks(this);
    }
    updatePresets() {
        UpdatePresets(this);
    }
    updateVariableDefinitions() {
        UpdateVariableDefinitions(this);
    }
}
runEntrypoint(ModuleInstance, UpgradeScripts);
//# sourceMappingURL=main.js.map