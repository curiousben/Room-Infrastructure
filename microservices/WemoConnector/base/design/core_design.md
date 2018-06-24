# WemoConnector Core Design and Thoughts:

The purpose of this microservice is make a pluggable interface with WeMo devices. This microservice will allow redisMQ infrastructure to interact with WeMo devices so that they can be triggered by a host of events.

## Core Design Requeriments:

1. The Connector will have handlers for each type of WemoDevice with corresponding configuration files. These handlers will be pluggable so each will have its own module.
2. The Connector will automatically turn off all devices and not accept anymore activation requests when the "sleep mode" has been activated. Wemo devices will resume normal operations when a "wake up" signal is received.
3. When the connector initializes the connector will gather and keep the current state of the configured device in memory.
4. If the connector loses connnection all devices states will be uneffected.
5. The Connector is event driven meaning if no activation events are received then the connector will turn off all lights.

## Core Design Steps:

1. Initialize each handler until it has detected all of its known Wemo devices.**This step will not be completed until all devices are discovered**
2. 

### Initialization
1.

## Design Constraints
1. 

## Decision about design Constrains
1. 

## Library Layout

