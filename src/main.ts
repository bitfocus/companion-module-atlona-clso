import {
	InstanceBase,
	InstanceStatus,
	runEntrypoint,
	TelnetHelper,
	type SomeCompanionConfigField,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, NUM_INPUTS, NUM_OUTPUTS } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresets } from './presets.js'

export default class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig

	// Internal state
	powerOn: boolean = false
	inputPresent: boolean[] = new Array(NUM_INPUTS).fill(false)
	outputRoutings: number[] = new Array(NUM_OUTPUTS).fill(0)

	private telnet: TelnetHelper | null = null
	private receiveBuffer: string = ''
	private pollTimer: ReturnType<typeof setInterval> | null = null

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateStatus(InstanceStatus.Disconnected)

		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()

		this.initVariables()
		this.connectTelnet()
	}

	async destroy(): Promise<void> {
		this.stopPolling()
		if (this.telnet) {
			this.telnet.destroy()
			this.telnet = null
		}
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config

		this.stopPolling()
		if (this.telnet) {
			this.telnet.destroy()
			this.telnet = null
		}

		this.connectTelnet()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	// ── Telnet Connection ─────────────────────────────────────────────────────

	private connectTelnet(): void {
		if (!this.config.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'No IP address configured')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)

		this.telnet = new TelnetHelper(this.config.host, this.config.port, {
			reconnect: true,
			reconnect_interval: 5000,
		})

		this.telnet.on('connect', () => {
			this.log('debug', 'Telnet connected')
			this.updateStatus(InstanceStatus.Ok)
			this.receiveBuffer = ''

			// Query current state on connection
			this.queryAllStatus()
			this.startPolling()
		})

		this.telnet.on('data', (data: Buffer) => {
			this.receiveBuffer += data.toString()
			this.processBuffer()
		})

		this.telnet.on('error', (err: Error) => {
			this.log('error', `Telnet error: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		})

		this.telnet.on('end', () => {
			this.log('debug', 'Telnet connection ended')
			this.updateStatus(InstanceStatus.Disconnected)
		})

		this.telnet.on('status_change', (status, message) => {
			this.updateStatus(status, message)
		})

		this.telnet.connect()
	}

	// ── Data Parsing ──────────────────────────────────────────────────────────

	private processBuffer(): void {
		const lines = this.receiveBuffer.split(/\r?\n/)

		// Keep the last incomplete line in the buffer
		this.receiveBuffer = lines.pop() ?? ''

		for (const line of lines) {
			const trimmed = line.trim()
			if (trimmed) {
				this.handleResponse(trimmed)
			}
		}
	}

	private handleResponse(response: string): void {
		this.log('debug', `Received: ${response}`)

		// Power status: "PWON" or "PWOFF"
		if (response === 'PWON' || response === 'PWOFF') {
			this.powerOn = response === 'PWON'
			this.setVariableValues({ power_on: this.powerOn })
			this.checkFeedbacks('power_on', 'power_off')
			return
		}

		// Input status: "InputStatus 00000000"
		const inputStatusMatch = response.match(/^InputStatus\s+([01]{8})$/)
		if (inputStatusMatch) {
			const statusStr = inputStatusMatch[1]
			for (let i = 0; i < NUM_INPUTS; i++) {
				this.inputPresent[i] = statusStr[i] === '1'
			}
			const values: Record<string, boolean> = {}
			for (let i = 0; i < NUM_INPUTS; i++) {
				values[`input_${i + 1}_present`] = this.inputPresent[i] ?? false
			}
			this.setVariableValues(values)
			this.checkFeedbacks('input_signal')
			return
		}

		// Routing status: "x2AVx1,x2AVx2,x3AVx3,x4AVx4"
		// Each token xNAVxM means input N is routed to output M
		if (/^x\d+AVx\d/.test(response)) {
			this.parseRoutingStatus(response)
			return
		}
	}

	/**
	 * Parse routing status string like "x2AVx1,x2AVx2,x3AVx3,x4AVx4"
	 * Sets outputRoutings[output-1] = inputNumber
	 */
	private parseRoutingStatus(status: string): void {
		// Reset all outputs
		this.outputRoutings = new Array(NUM_OUTPUTS).fill(0)

		const tokens = status.split(',')
		for (const token of tokens) {
			const match = token.trim().match(/^x(\d+)AVx(\d+)$/)
			if (match) {
				const input = parseInt(match[1], 10)
				const output = parseInt(match[2], 10)
				if (output >= 1 && output <= NUM_OUTPUTS) {
					this.outputRoutings[output - 1] = input
				}
			}
		}

		const values: Record<string, number> = {}
		for (let i = 0; i < NUM_OUTPUTS; i++) {
			values[`output_${i + 1}_source`] = this.outputRoutings[i] ?? 0
		}
		this.setVariableValues(values)
		this.checkFeedbacks('output_sources')
	}

	// ── Commands ──────────────────────────────────────────────────────────────

	async sendCommand(command: string): Promise<void> {
		if (!this.telnet || !this.telnet.isConnected) {
			this.log('warn', `Cannot send command "${command}" — not connected`)
			return
		}
		this.log('debug', `Sending: ${command}`)
		await this.telnet.send(`${command}\r\n`)
	}

	/**
	 * Query all variable-backed state from the device (power, input signal
	 * presence, and routing). Exposed as public so the refresh_all action
	 * callback and the polling timer can both call it.
	 */
	queryAllStatus(): void {
		// Use a small delay between queries to avoid flooding the device
		const queries = ['PWSTA', 'InputStatus', 'Status']
		let delay = 0
		for (const query of queries) {
			setTimeout(() => {
				this.sendCommand(query).catch((err: unknown) => {
					this.log('error', `Failed to send query ${query}: ${String(err)}`)
				})
			}, delay)
			delay += 200
		}
	}

	private startPolling(): void {
		this.stopPolling()
		const intervalMs = (this.config.poll_interval ?? 10) * 1000
		this.pollTimer = setInterval(() => {
			this.queryAllStatus()
		}, intervalMs)
	}

	private stopPolling(): void {
		if (this.pollTimer !== null) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
		}
	}

	// ── Internal helpers ──────────────────────────────────────────────────────

	private initVariables(): void {
		const values: Record<string, string | number | boolean> = {
			power_on: false,
		}
		for (let i = 1; i <= NUM_INPUTS; i++) {
			values[`input_${i}_present`] = false
		}
		for (let i = 1; i <= NUM_OUTPUTS; i++) {
			values[`output_${i}_source`] = 0
		}
		this.setVariableValues(values)
	}

	// ── Delegate update methods ───────────────────────────────────────────────

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
