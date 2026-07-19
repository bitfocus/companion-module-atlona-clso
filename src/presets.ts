import type { CompanionPresetDefinitions } from '@companion-module/base'
import { combineRgb } from '@companion-module/base'
import type ModuleInstance from './main.js'
import { NUM_INPUTS, NUM_OUTPUTS } from './variables.js'

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}

	// Power presets
	presets['power_on'] = {
		type: 'button',
		category: 'Power',
		name: 'Power On',
		style: {
			text: 'POWER\\nON',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 100, 0),
		},
		feedbacks: [
			{
				feedbackId: 'power_on',
				options: {},
				style: {
					bgcolor: combineRgb(0, 204, 0),
					color: combineRgb(255, 255, 255),
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'power_on', options: {} }],
				up: [],
			},
		],
	}

	presets['power_off'] = {
		type: 'button',
		category: 'Power',
		name: 'Power Off (Standby)',
		style: {
			text: 'STANDBY',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(100, 0, 0),
		},
		feedbacks: [
			{
				feedbackId: 'power_off',
				options: {},
				style: {
					bgcolor: combineRgb(204, 0, 0),
					color: combineRgb(255, 255, 255),
				},
			},
		],
		steps: [
			{
				down: [{ actionId: 'power_off', options: {} }],
				up: [],
			},
		],
	}

	// Reset routing
	presets['reset_routing'] = {
		type: 'button',
		category: 'Routing',
		name: 'Reset to 1:1 Routing',
		style: {
			text: 'RESET\\nROUTING',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(50, 50, 50),
		},
		feedbacks: [],
		steps: [
			{
				down: [{ actionId: 'reset_routing', options: {} }],
				up: [],
			},
		],
	}

	// Route input to output presets
	for (let input = 1; input <= NUM_INPUTS; input++) {
		for (let output = 1; output <= NUM_OUTPUTS; output++) {
			const presetId = `route_in${input}_out${output}`
			presets[presetId] = {
				type: 'button',
				category: 'Routing',
				name: `Input ${input} → Output ${output}`,
				style: {
					text: `IN ${input}\\n→ OUT ${output}`,
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 50, 150),
				},
				feedbacks: [
					{
						feedbackId: 'output_routing',
						options: { input: input, output: output },
						style: {
							bgcolor: combineRgb(255, 153, 0),
							color: combineRgb(255, 255, 255),
						},
					},
				],
				steps: [
					{
						down: [{ actionId: 'route_input_to_output', options: { input: input, output: output } }],
						up: [],
					},
				],
			}
		}
	}

	// Route input to all outputs presets
	for (let input = 1; input <= NUM_INPUTS; input++) {
		const presetId = `route_in${input}_all`
		presets[presetId] = {
			type: 'button',
			category: 'Routing',
			name: `Input ${input} → All Outputs`,
			style: {
				text: `IN ${input}\\n→ ALL`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 100, 0),
			},
			feedbacks: [],
			steps: [
				{
					down: [{ actionId: 'route_input_to_all', options: { input: input } }],
					up: [],
				},
			],
		}
	}

	// Refresh all variables
	presets['refresh_all'] = {
		type: 'button',
		category: 'Status',
		name: 'Refresh All Variables',
		style: {
			text: 'REFRESH',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(30, 30, 100),
		},
		feedbacks: [],
		steps: [
			{
				down: [{ actionId: 'refresh_all', options: {} }],
				up: [],
			},
		],
	}

	// Panel lock/unlock
	presets['lock_panel'] = {
		type: 'button',
		category: 'Front Panel',
		name: 'Lock Front Panel',
		style: {
			text: 'LOCK\\nPANEL',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(100, 50, 0),
		},
		feedbacks: [],
		steps: [
			{
				down: [{ actionId: 'lock_panel', options: {} }],
				up: [],
			},
		],
	}

	presets['unlock_panel'] = {
		type: 'button',
		category: 'Front Panel',
		name: 'Unlock Front Panel',
		style: {
			text: 'UNLOCK\\nPANEL',
			size: '14',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 100, 100),
		},
		feedbacks: [],
		steps: [
			{
				down: [{ actionId: 'unlock_panel', options: {} }],
				up: [],
			},
		],
	}

	self.setPresetDefinitions(presets)
}
