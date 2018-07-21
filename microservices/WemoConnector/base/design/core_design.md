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

1. Initialize WemoConnector Library pass in configurations
2. Initialize WemoConnector configuration
3. Validate passed in Wemo configuration
4. Load handlers
5. Until there the same number of loaded devices in the active devices map as there are in the config then do:
  1. Pass in handler wemo client, config, and deviceInfo
  2. load config data
  3. get client from deviceInfo
  4. get binary state of switch
  5. if off turn it on
  6. set last time of change to current time
6. Get discoveryInterval from config object and initialize the device discovery timer
7. Get refreshInterval from config object and initialize the device refresh timer
8. Listen for activation events

### Running State:

#### Activation event and WemoConnector mode logic

1. IF activate event received AND in "awake" mode:
  1. IF lights are not turned on:
    1. Turn on lights
    2. Remember switch state
2. IF activate event received AND in "sleep" mode:
  1. Ignore activation mode

#### WemoConnector mode logic

1. IF mode received:
  1. set mode

#### StateRefresher Logic

1. IF a 'SwitchOff' event is recieved:
  1. Turn off all devices

## Design Constraints
1. Wemo Connector will turn off lights after a set amount of time.
2. Wemo Connector library is community made not official.
3. "Wake up" and "sleep mode" modes override BLE activation events.
4. When activating the Wemo Connector to turn on ALL devices are turned on

## Decision about design Constrains
1. If a kill signal is requireed from external sources then we would need another statefull microservice external to this connector which would increase the complexcity beyond the Aggregator. While it would lead to a more decoupled process the Microservice that would be needed for this would be less generic and would be mor error prone.
2. Lack of official support drives this decision. If or when an official library is created, I will use that library.
3. BLE events are always being received and thus the connector will always turn on lights even at 2am. Since humans like their sleep the Wemo Conenctor needs to respect a mammal's need to get some shuteye.
4. For now this keeps the design simple and while use cases might arise in the future, for now when someone has authorized activation rights everything should turn on.

## Library Layout

lib/
├── errors
│   ├── initializationError.js
│   └── wemoConnectorError.js
├── handlers
│   └── wemoSwitch.js
├── processTimers
│   ├── deviceDiscovery.js
│   └── deviceStateRefresher.js
└── utilities
    └── wemoConfig.js

4 directories, 6 files

# References
## Supplemental documentation

1. Private members of javascript "classes" and general structure of the classes
  1. Blog that initially guided the developement of the classes in this library. [Link](https://medium.com/front-end-hacking/private-methods-in-es6-and-writing-your-own-db-b2e30866521f)
  2. Offical documentation of Javascript Classes. [Link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
  3. Offical documentation of Symbol primative types in Javascript. [Link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)

