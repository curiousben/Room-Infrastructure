# Room-Infrastructure
### Underlying Technologies:
* Docker (Swarm && Compose)
* Node.js (ES6)
* RaspberryPi 3 (Raspbian)
* Bluetooth Low Energy
* Redis
* WeMo SmartRoom Products
* Linux (Ubuntu)

>These projects are planned to be used in the construction of a message based smart room. One library will consist of a simple wrapper that allows me to quickly develop microservices that is tethered by a Redis message queue implementation. The other library will allow me to bring up new smart plugs and easly connect them to a smart plug manager server. Orchestration of microservices will be based off of docker swarm.

Folder Structure:

1. Devices: Shell scripts for specific devices will be located here.
2. Infrastructure: Docker-Swarm, and later compose config files will be located here. Shell scripts for deploying docker-swarm services will be located here as well.
3. Lib: Message libraries and other utilitarian libaries that will be used by all microservices will be located here
4. Tools: Miscellous shell scripts to make life easier will be located here.
5. Microservices: The acutal microservices that are responsible for doing work will be here. 

RedisMQ Library - A simple library that can transports messages using redis with native Promises
===========================

## Installation

## Docker parent image

## Configuration

## Usage
