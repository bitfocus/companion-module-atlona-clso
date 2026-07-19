import { NUM_INPUTS, NUM_OUTPUTS } from './variables.js';
export function UpdateActions(self) {
    const actions = {
        // ── Power ────────────────────────────────────────────────────────────────
        power_on: {
            name: 'Power: Power On Matrix',
            options: [],
            callback: async () => {
                await self.sendCommand('PWON');
                // Query power state after command
                await self.sendCommand('PWSTA');
            },
        },
        power_off: {
            name: 'Power: Place Matrix in Standby',
            options: [],
            callback: async () => {
                await self.sendCommand('PWOFF');
                await self.sendCommand('PWSTA');
            },
        },
        // ── Routing ──────────────────────────────────────────────────────────────
        route_input_to_output: {
            name: 'Routing: Route Input to Output(s)',
            options: [
                {
                    id: 'input',
                    type: 'number',
                    label: 'Input Number',
                    default: 1,
                    min: 1,
                    max: NUM_INPUTS,
                },
                {
                    id: 'output',
                    type: 'number',
                    label: 'Output Number',
                    default: 1,
                    min: 1,
                    max: NUM_OUTPUTS,
                },
            ],
            callback: async (action) => {
                const input = action.options['input'];
                const output = action.options['output'];
                await self.sendCommand(`x${input}AVx${output}`);
                await self.sendCommand('Status');
            },
        },
        route_input_to_all: {
            name: 'Routing: Route Input to All Outputs',
            options: [
                {
                    id: 'input',
                    type: 'number',
                    label: 'Input Number',
                    default: 1,
                    min: 1,
                    max: NUM_INPUTS,
                },
            ],
            callback: async (action) => {
                const input = action.options['input'];
                await self.sendCommand(`x${input}All`);
                await self.sendCommand('Status');
            },
        },
        reset_routing: {
            name: 'Routing: Reset to One-to-One Routing',
            options: [],
            callback: async () => {
                await self.sendCommand('All#');
                await self.sendCommand('Status');
            },
        },
        route_audio: {
            name: 'Routing: Route Audio from Input to Output',
            options: [
                {
                    id: 'input',
                    type: 'number',
                    label: 'Input Number (video)',
                    default: 1,
                    min: 1,
                    max: NUM_INPUTS,
                },
                {
                    id: 'output',
                    type: 'number',
                    label: 'Output Number (audio)',
                    default: 1,
                    min: 1,
                    max: NUM_OUTPUTS,
                },
            ],
            callback: async (action) => {
                const input = action.options['input'];
                const output = action.options['output'];
                await self.sendCommand(`x${input}Ax${output}`);
            },
        },
        // ── Output Control ───────────────────────────────────────────────────────
        toggle_output: {
            name: 'Output: Toggle Output Channel',
            options: [
                {
                    id: 'output',
                    type: 'number',
                    label: 'Output Number',
                    default: 1,
                    min: 1,
                    max: NUM_OUTPUTS,
                },
            ],
            callback: async (action) => {
                const output = action.options['output'];
                await self.sendCommand(`x${output}$`);
            },
        },
        mute_output: {
            name: 'Audio: Mute/Unmute Output Audio',
            options: [
                {
                    id: 'output',
                    type: 'number',
                    label: 'Output Number',
                    default: 1,
                    min: 1,
                    max: NUM_OUTPUTS,
                },
                {
                    id: 'state',
                    type: 'dropdown',
                    label: 'Mute State',
                    default: 'on',
                    choices: [
                        { id: 'on', label: 'Mute On' },
                        { id: 'off', label: 'Mute Off' },
                    ],
                },
            ],
            callback: async (action) => {
                const output = action.options['output'];
                const state = action.options['state'];
                await self.sendCommand(`VOUTMute ${output} ${state}`);
            },
        },
        mirror_audio: {
            name: 'Audio: Enable/Disable Audio Mirroring',
            options: [
                {
                    id: 'audio_output',
                    type: 'number',
                    label: 'Audio Output',
                    default: 1,
                    min: 1,
                    max: NUM_OUTPUTS,
                },
                {
                    id: 'video_output',
                    type: 'number',
                    label: 'Video Output',
                    default: 1,
                    min: 1,
                    max: NUM_OUTPUTS,
                },
                {
                    id: 'state',
                    type: 'dropdown',
                    label: 'State',
                    default: 'on',
                    choices: [
                        { id: 'on', label: 'Enable' },
                        { id: 'off', label: 'Disable' },
                    ],
                },
            ],
            callback: async (action) => {
                const audioOut = action.options['audio_output'];
                const videoOut = action.options['video_output'];
                const state = action.options['state'];
                await self.sendCommand(`MirrorAudio ${audioOut} ${videoOut} ${state}`);
            },
        },
        set_volume_in: {
            name: 'Audio: Set Input Volume Level',
            options: [
                {
                    id: 'level',
                    type: 'number',
                    label: 'Volume Level',
                    default: 0,
                    min: -100,
                    max: 0,
                },
            ],
            callback: async (action) => {
                const level = action.options['level'];
                await self.sendCommand(`VIN ${level}`);
            },
        },
        set_volume_out: {
            name: 'Audio: Set Output Volume Level',
            options: [
                {
                    id: 'level',
                    type: 'number',
                    label: 'Volume Level',
                    default: 0,
                    min: -100,
                    max: 0,
                },
            ],
            callback: async (action) => {
                const level = action.options['level'];
                await self.sendCommand(`VOUT ${level}`);
            },
        },
        // ── Front Panel ──────────────────────────────────────────────────────────
        lock_panel: {
            name: 'Panel: Lock Front Panel Buttons',
            options: [],
            callback: async () => {
                await self.sendCommand('Lock');
            },
        },
        unlock_panel: {
            name: 'Panel: Unlock Front Panel Buttons',
            options: [],
            callback: async () => {
                await self.sendCommand('Unlock');
            },
        },
        blink: {
            name: 'Panel: Enable/Disable Power Button Blink',
            options: [
                {
                    id: 'state',
                    type: 'dropdown',
                    label: 'State',
                    default: 'on',
                    choices: [
                        { id: 'on', label: 'Enable Blink' },
                        { id: 'off', label: 'Disable Blink' },
                    ],
                },
            ],
            callback: async (action) => {
                const state = action.options['state'];
                await self.sendCommand(`Blink ${state}`);
            },
        },
        // ── CEC ──────────────────────────────────────────────────────────────────
        trig_cec: {
            name: 'CEC: Trigger Stored CEC Command',
            options: [
                {
                    id: 'output',
                    type: 'number',
                    label: 'Output Number',
                    default: 1,
                    min: 1,
                    max: NUM_OUTPUTS,
                },
                {
                    id: 'state',
                    type: 'dropdown',
                    label: 'CEC Command',
                    default: 'on',
                    choices: [
                        { id: 'on', label: 'On' },
                        { id: 'off', label: 'Off' },
                    ],
                },
            ],
            callback: async (action) => {
                const output = action.options['output'];
                const state = action.options['state'];
                await self.sendCommand(`TrigCEC${output} ${state}`);
            },
        },
        // ── Status ───────────────────────────────────────────────────────────────
        refresh_all: {
            name: 'Status: Refresh All Variables Now',
            options: [],
            callback: async () => {
                self.queryAllStatus();
            },
        },
    };
    self.setActionDefinitions(actions);
}
//# sourceMappingURL=actions.js.map