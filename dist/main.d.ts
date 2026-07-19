import { InstanceBase, type SomeCompanionConfigField } from '@companion-module/base';
import { type ModuleConfig } from './config.js';
export default class ModuleInstance extends InstanceBase<ModuleConfig> {
    config: ModuleConfig;
    powerStatus: string;
    inputStatuses: string[];
    outputRoutings: string[];
    private telnet;
    private receiveBuffer;
    private pollTimer;
    constructor(internal: unknown);
    init(config: ModuleConfig): Promise<void>;
    destroy(): Promise<void>;
    configUpdated(config: ModuleConfig): Promise<void>;
    getConfigFields(): SomeCompanionConfigField[];
    private connectTelnet;
    private processBuffer;
    private handleResponse;
    /**
     * Parse routing status string like "x2AVx1,x2AVx2,x3AVx3,x4AVx4"
     * Sets outputRoutings[output-1] = inputNumber
     */
    private parseRoutingStatus;
    sendCommand(command: string): Promise<void>;
    /**
     * Query all variable-backed state from the device (power, input signal
     * presence, and routing). Exposed as public so the refresh_all action
     * callback and the polling timer can both call it.
     */
    queryAllStatus(): void;
    private startPolling;
    private stopPolling;
    private initVariables;
    updateActions(): void;
    updateFeedbacks(): void;
    updatePresets(): void;
    updateVariableDefinitions(): void;
}
//# sourceMappingURL=main.d.ts.map