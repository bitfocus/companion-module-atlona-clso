export const NUM_INPUTS = 8;
export const NUM_OUTPUTS = 4;
export function UpdateVariableDefinitions(self) {
    const variables = [
        {
            variableId: 'power_status',
            name: 'Power Status (PWON/PWOFF)',
        },
    ];
    for (let i = 1; i <= NUM_INPUTS; i++) {
        variables.push({
            variableId: `input_${i}_status`,
            name: `Input ${i} Signal Status (0=no signal, 1=signal present)`,
        });
    }
    for (let i = 1; i <= NUM_OUTPUTS; i++) {
        variables.push({
            variableId: `output_${i}_routing`,
            name: `Output ${i} Routed Input`,
        });
    }
    self.setVariableDefinitions(variables);
}
//# sourceMappingURL=variables.js.map