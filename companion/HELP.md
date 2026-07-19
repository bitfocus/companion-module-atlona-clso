# Atlona AT-UHD-CLSO-840 Companion Module

This module provides control of the Atlona AT-UHD-CLSO-840 8×4 HDBaseT/HDMI Video Matrix via its Telnet API.

## Configuration

| Field | Description |
|-------|-------------|
| **Device IP Address** | IP address of the AT-UHD-CLSO-840 on your network |
| **Telnet Port** | TCP port for Telnet (default: **23**) |

## Variables

| Variable | Description |
|----------|-------------|
| `$(atlona-clso:power_status)` | Current power state: `PWON` or `PWOFF` |
| `$(atlona-clso:input_1_status)` – `$(atlona-clso:input_8_status)` | Signal status for each input: `1` = signal present, `0` = no signal |
| `$(atlona-clso:output_1_routing)` – `$(atlona-clso:output_4_routing)` | Input number currently routed to each output |

## Actions

### Power
- **Power On Matrix** — Sends `PWON`
- **Place Matrix in Standby** — Sends `PWOFF`
- **Query Power Status** — Sends `PWSTA`

### Routing
- **Route Input to Output(s)** — Sends `x{input}AVx{output}`
- **Route Input to All Outputs** — Sends `x{input}All`
- **Reset to One-to-One Routing** — Sends `All#`
- **Route Audio from Input to Output** — Sends `x{input}Ax{output}`

### Output Control
- **Enable or Disable Output** — Sends `x{output}$`
- **Mute/Unmute Output Audio** — Sends `VOUTMute {output} on/off`
- **Enable/Disable Audio Mirroring** — Sends `MirrorAudio {audioOut} {videoOut} on/off`
- **Set Input Volume Level** — Sends `VIN {level}`
- **Set Output Volume Level** — Sends `VOUT {level}`

### Front Panel
- **Lock Front Panel Buttons** — Sends `Lock`
- **Unlock Front Panel Buttons** — Sends `Unlock`
- **Enable/Disable Power Button Blink** — Sends `Blink on/off`

### CEC
- **Trigger Stored CEC Command** — Sends `TrigCEC{output} on/off`

### Status Queries
- **Query Input Signal Status** — Sends `InputStatus`
- **Query Routing Status** — Sends `Status`
- **Query Front Panel Lock Status** — Sends `LockST`
- **Query Network Configuration** — Sends `IPCFG`
- **Query Firmware Version** — Sends `Version`
- **Query Device Model** — Sends `Type`

## Feedbacks

| Feedback | Description |
|----------|-------------|
| **Power: Is Powered On** | True when matrix reports `PWON` |
| **Power: Is In Standby** | True when matrix reports `PWOFF` |
| **Input: Has Signal** | True when the selected input has an active signal |
| **Routing: Output Is Routed to Input** | True when the selected output is routed to the selected input |

## Notes

- All Telnet commands are case-sensitive
- The module automatically queries power, input, and routing status upon connecting
- The module will attempt to reconnect every 5 seconds if the connection is lost
