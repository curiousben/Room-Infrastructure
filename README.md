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
This project can be installed locally by the command:

```
  wget https://github.com/insatiableben/Room-Infrastructure/raw/master/lib/RedisMQ/nodejs/docker/node.redis.mq.tar.gz && npm install node.redis.mq.tar.gz
```
another mehtod of using this library is building off of a RedisMQ docker base-image.
```
  docker pull insiatableben/RedisMQ
```

## Docker parent image

The Docker image contains the following:
- Debian (buster)
- Node.js (v6.11.2)
- NPM (5.4.0)
- RedisMQ (Globally installed)

Release Schedule:

Release | Contents
------- | --------
v1.0.0  | Initial release:<br/> [x] Added RedisMQ<br/>[x] Added cURL, telnet
------- | --------
v1.1.0  | DockerImage:<br/> [ ] Create Markdown guide<br/> [ ] Update Node.js
------- | --------
v1.2.0  | Automation:<br/> [ ] Automate testing and building of image
------- | --------

## Configuration

The general configuration is as follows:

```js
{
  "microservice.metadata":{
      "service.id": "",
      "component.id":"",
      "errorPayload": {
        "queue":"",
      },
      "errorMessage": {
        "queue":"",
      }
    },
    "broker":{
    "host":"",
    "port":6379,
    "retry.attempts": null,
    "retry.interval": 10
  },
  "publishers":{
    "main.publisher":{
      "queue":"",
    }
  },
  "subscribers":{
    "main.subscriber":{
      "queue":"",
      "type":""
    }
  }
}
```
Note: having a producer and subscriber is not enforced and you have 

## Usage
