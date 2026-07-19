import { Regex } from '@companion-module/base';
export function GetConfigFields() {
    return [
        {
            type: 'static-text',
            id: 'info',
            label: 'Information',
            value: 'Connect to the Atlona AT-UHD-CLSO-840 via Telnet. Default port is 23.',
            width: 12,
        },
        {
            type: 'textinput',
            id: 'host',
            label: 'Device IP Address',
            width: 8,
            default: '',
            regex: Regex.IP,
        },
        {
            type: 'number',
            id: 'port',
            label: 'Telnet Port',
            width: 4,
            min: 1,
            max: 65535,
            default: 23,
        },
    ];
}
//# sourceMappingURL=config.js.map