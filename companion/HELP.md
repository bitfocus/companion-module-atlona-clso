# Atlona AT-UHD-CLSO-840 Companion Module

This module provides control of the Atlona AT-UHD-CLSO-840 8×4 HDBaseT/HDMI Video Matrix via its Telnet API.

You will need the device's IP address (which you can view through the front panel menu) and you will need to ensure 
that Telnet is enabled on the device without authentication.  Don't use this on a public or uncontrolled network.

## Configuration

| Field                 | Description                                                                |
|-----------------------|----------------------------------------------------------------------------|
| **Device IP Address** | IP address of the AT-UHD-CLSO-840 on your network                          |
| **Telnet Port**       | TCP port for Telnet (default: **23**)                                      | 
| **Polling Interval**  | How often to query the device for status updates (default: **10 seconds**) |

## Variables

| Variable                                                            | Description                                                         |
|---------------------------------------------------------------------|---------------------------------------------------------------------|
| `$(atlona-clso:power_status)`                                       | Current power state: `PWON` or `PWOFF`                              |
| `$(atlona-clso:input_1_status)` – `$(atlona-clso:input_8_status)`   | Signal status for each input: `1` = signal present, `0` = no signal |
| `$(atlona-clso:output_1_source)` – `$(atlona-clso:output_4_source)` | Input number currently routed to each output                        |

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
- **Trigger On/Off CEC Command** — Sends `TrigCEC{output} on/off` to trigger a display to turn on or off via CEC.  Not all displays support this feature.

### Status
- **Refresh All Variables Now** — Sends several commands to update the variables.  Useful if you want to use a longer polling interval and need to update the variables on demand. 

## Feedbacks

| Feedback                               | Description                                                   |
|----------------------------------------|---------------------------------------------------------------|
| **Power: Unit Is Powered On**          | True when matrix reports `PWON`                               |
| **Power: Unit Is In Standby**          | True when matrix reports `PWOFF`                              |
| **Input: Has Signal**                  | True when the selected input is receiving signal              |
| **Routing: Output Is Routed to Input** | True when the selected output is routed to the selected input |

## Notes

- The module automatically queries power, input, and routing status upon connecting
- The module will attempt to reconnect every 5 seconds if the connection is lost
