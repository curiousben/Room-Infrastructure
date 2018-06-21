# WemoConnector Core Design and Thoughts:

The purpose of this microservice is make a pluggable interface with WeMo devices. This microservice will allow redisMQ infrastructure to interact with WeMo devices so that they can be triggered by a host of events.

## Core Design:

1. The Connector will have handlers for each type of WemoDevice with corresponding configuration files. These handlers will be pluggable so each will have its own module.
2. External Microservices can trigger a "sleep mode" where the connector will not accept any activation events, until it receives a "wake up" message.
3. The Connector will automatically turn off all devices after a configured set of time has passed.

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

