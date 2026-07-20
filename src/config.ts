import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: number
	poll_interval: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			label: 'Information',
			value: 'Connect to the Atlona AT-UHD-CLSO-840 via the Telnet API. You will need the IP address of the matrix, and will need to have Telnet enabled without authentication.  Do not use outside of a controlled network environment.',
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
		{
			type: 'number',
			id: 'poll_interval',
			label: 'Poll Interval (seconds)',
			width: 4,
			min: 1,
			max: 300,
			default: 10,
		},
	]
}
