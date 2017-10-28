#Filter Core Design and Thoughts:

This markdown file documents the thoughts and assumptions about the design for Filter microservice. This is subject to change based on limititations encountered when implimenting the design.

## Core Design:
1. Read RedisMQ and Filter config file
2. Initialize RedisMQ then BLE listener
3. Listen for some BLE device transmission.
4. Create message with node name and detected Device and its RSSI value.
5. Send message to RedisMQ Queue
6. Repeat 3

## Message Payload

- Type: JSONObject
- Notes: device_UUIDs can be node uuids. There are no restrictions on the RSSI values that are transmitted.

_Example:_

```js
{
  "device": {
    "uuid": "",
    "rssi": ""
  },
  "node": {
    "name": ""
  }
}
```
With this message payload the data parsor will have who detected this device and at what rssi value.

## Data transmission Constraints
1. This device will not edge compute but will defer this process to a more centralized group of processes.
2. Each message will have one device's rssi value and the node that detected the device.
2. No RSSI constraints will be enforced if the device picks up the signal then it is sent.

## Decision about Constrains
- This device will not edge compute but will defer this process to a more centralized group of processes.

This removes the burden of processing power off of the less powerful devices and delegates it to a stronger instance. The message sizes can now be every small which will allow more data to be available, which would in turn faster response time to when a device enters the field of detection.

- Each message will have one device's rssi value and the node that detected the device.

This allows downstream processes to know at a snapshot who picked up the device and at what RSSI strength. It also allows downstream processes to enforce new rules without having to distribute these rules to all devices.

- No RSSI constraints will be enforced if the device picks up the signal then it is sent.

This follows a simliar line of reasoning as the previous justification, but also allows each device to require little to no calibration and can scale with any device no matter how powerful the BLE detection module is on the device.
