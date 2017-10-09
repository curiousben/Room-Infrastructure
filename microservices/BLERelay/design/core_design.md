#BLERelay Core Design and Thoughts:

This markdown file documents the thoughts and assumptions about the design for BLERelay microservice. This is subject to change based on limititations encountered when implimenting the design.

## Core Design:
1. Read RedisMQ and BLERelay config file
2. Initialize RedisMQ then BLERelay broadcast, then BLERelay detection
3. Listen to BLE RSSI transmission
4. Create message with Node_name Device and its RSSI value for all deivces detected.
5. Send message to RedisMQ Queue
6. Repeat 3

## Message Payload

- Type: JSONObject
- Notes: device_UUIDs cannot be node uuids only devices that are not nodes. The RSSI values can only be values less than the delta detection neighborhood.

_Example:_

```js
{
  "device_UUID": "device_uuid",
  "rssi": "rssi_value",	
  "nodes": {
  	"local_node": {
    	"rssi": 0
  	},
  	"detected_node": {
    	"rssi": rssi_value 
  	},
  	.
  	.
  	.
  }
}
```
With this message payload the data parsor will have a snapshot with each device in relation to all of the other nodes.

## Data transmission Constraints
1. Each message will have one device's rssi value and all other detected nodes.
2. A global RSSI detection delta neighborhood will be used.
3. Each detection node has to see at least one other detection node. 

## Decision about Constrains
- Each message will have one device's rssi value and all other detected nodes.

Messages that only have one device and all other nodes detected (in real situations might max out at 5 but could be n) keeps message small but have alot of information. Downside, how to juggle a always fresh roster of known nodes.

- A global RSSI detection delta neighborhood will be used.

_**Questions:**_

> Should BLERelay have a RSSI threshold that is determined locally? or globally?

:+1: Globally Offers a consistency so all Raspberry Pi’s read at the same accuracy and a sense of uniformity when choosing locations for nodes. But, when a node is in a _"Dead Zone"_ (Where the node doesn't see any other nodes) then any devices can't be assumed to be in the room. 

Locally offers a more realistic way of recording data since each node can has the best RSSI delta that will work for where it is actually located. The microservice doesn’t scale easy unless some automation occurs where the local RSSI strength is tested and then adjustments are made.

- Each node has to see at least one other node.

When sending data we can guarantee that another node can see this device as well. If we allow data to be sent with out it then we lose guarantee of trianglation. 