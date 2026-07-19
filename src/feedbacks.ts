import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { combineRgb } from '@companion-module/base'
import type ModuleInstance from './main.js'
import { NUM_INPUTS, NUM_OUTPUTS } from './variables.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {
		power_on: {
			type: 'boolean',
			name: 'Power: Is Powered On',
			description: 'Change button style when the matrix is powered on',
			defaultStyle: {
				bgcolor: combineRgb(0, 204, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return self.powerOn
			},
		},

		power_off: {
			type: 'boolean',
			name: 'Power: Is In Standby',
			description: 'Change button style when the matrix is in standby mode',
			defaultStyle: {
				bgcolor: combineRgb(204, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [],
			callback: () => {
				return !self.powerOn
			},
		},

		input_signal: {
			type: 'boolean',
			name: 'Input: Has Signal',
			description: 'Change button style when an input has an active signal',
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 255),
				color: combineRgb(255, 255, 255),
			},
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
			callback: (feedback) => {
				const input = feedback.options['input'] as number
				return self.inputPresent[input - 1] ?? false
			},
		},

		output_routing: {
			type: 'boolean',
			name: 'Routing: Output Is Routed to Input',
			description: 'Change button style when an output is routed to a specific input',
			defaultStyle: {
				bgcolor: combineRgb(255, 153, 0),
				color: combineRgb(255, 255, 255),
			},
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
			callback: (feedback) => {
				const input = feedback.options['input'] as number
				const output = feedback.options['output'] as number
				return self.outputRoutings[output - 1] === input
			},
		},
	}

	self.setFeedbackDefinitions(feedbacks)
}
