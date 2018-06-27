# WemoConnector Core Design and Thoughts:

The purpose of this microservice is make a pluggable interface with WeMo devices. This microservice will allow redisMQ infrastructure to interact with WeMo devices so that they can be triggered by a host of events.

## Core Design Requeriments:

1. The Connector will have handlers for each type of WemoDevice with corresponding configuration files. These handlers will be pluggable so each will have its own module.
2. The Connector will automatically turn off all devices and not accept anymore activation requests when the "sleep mode" has been activated. Wemo devices will resume normal operations when a "wake up" signal is received.
3. When the connector initializes the connector will gather and keep the current state of the configured device in memory.
4. If the connector loses connnection all devices states will be uneffected.
5. The Connector is event driven meaning if no activation events are received then the connector will turn off all lights.

## Core Design Steps:

### Initialization:

1. Check passed in Wemo configuration
2. Load Wemo Library configuration
3. Read configuration and determine which handler is being loaded or error out if either not handlers are specified or the handler that is specified does not exist
4. Initialize each handler until each handler has been successfully loaded for all configured devices
  1. Check passed in handler configuration
  2. Load handler configuration
  3. Discover device that the handler is configured to
5. Listen for activation events

### Running State:

1. IF event received activate AND a "wake up" signal has last been received:
  1. IF lights are not turned on:
    1. Turn on lights
    2. Remember switch state
2. IF "sleep mode" signal is received:
  1. IF lights are turned on:
    1. Turn off lights
    2. Don't accept BLE activation events
3. IF "wake up" signal is received:
  1. Accept activation events

## Design Constraints
1. Wemo Connector will turn off lights after a set amount of time.
2. Wemo Connector library is community made not official.
3. "Wake up" and "sleep mode" modes override BLE activation events.

## Decision about design Constrains
1. If a kill signal is requireed from external sources then we would need another statefull microservice external to this connector which would increase the complexcity beyond the Aggregator. While it would lead to a more decoupled process the Microservice that would be needed for this would be less generic and would be mor error prone.
2. Lack of official support drives this decision. If or when an official library is created, I will use that library.
3. BLE events are always being received and thus the connector will always turn on lights even at 2am. Since humans like their sleep the Wemo Conenctor needs to respect a mammal's need to get some shuteye

## Library Layout

lib
├── handlers
│   ├── lightSwtich
│   │   ├── lightSwtich.js
│   └── link
│       ├── link.js
│       └── linkHandlers
│           └── lightBulb.js
├── errors
│   ├── WemoConnectorError.js
│   └── initializationError.js
└── utilities
    └── initialize.js
