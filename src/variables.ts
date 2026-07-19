import type { CompanionVariableDefinition } from '@companion-module/base'
import type ModuleInstance from './main.js'

export const NUM_INPUTS = 8
export const NUM_OUTPUTS = 4

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const variables: CompanionVariableDefinition[] = [
		{
			variableId: 'power_on',
			name: 'Power On (true = powered on, false = standby)',
		},
	]

	for (let i = 1; i <= NUM_INPUTS; i++) {
		variables.push({
			variableId: `input_${i}_present`,
			name: `Input ${i} Signal Present (true = signal present, false = no signal)`,
		})
	}

	for (let i = 1; i <= NUM_OUTPUTS; i++) {
		variables.push({
			variableId: `output_${i}_routing`,
			name: `Output ${i} Routed Input Number (0 = unknown)`,
		})
	}

	self.setVariableDefinitions(variables)
}
