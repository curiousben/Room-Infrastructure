# WemoConnector Core Design and Thoughts:

The purpose of this microservice is make a pluggable interface with WeMo devices. This microservice will allow redisMQ infrastructure to interact with WeMo devices so that they can be triggered by a host of events.

## Core Design:

1. The Connector will have handlers for each type of WemoDevice with corresponding configuration files. These handlers will be pluggable so each will have its own module.
2. The Connector will also have a night time mode where if any devices are in an 'on' they will be turned off and wont be turned 

## Core Design Steps:

1. Initialize

### Initialization
1.

## Design Constraints
1. 

## Decision about design Constrains
1. 

## Library Layout

