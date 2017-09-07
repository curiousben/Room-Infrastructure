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
v1.1.0  | DockerImage:<br/> [ ] Create Markdown guide<br/> [ ] Update Node.js
v1.2.0  | Automation:<br/> [ ] Automate testing and building of image

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
Note:
- Having both a producer and subscriber is not enforced but you must make sure you have at least one of the workers configuration.
### Publisher:
>The publisher as of (Sept 6 2017) can only define the queue the publisher is listening to. Users have the ability to define any amount of publishers as long as they exist in the publishers section of the redisMQ configuration.

### Subscriber:
The subscriber as of (Sept 6 2017) can be of two types:
- "persistent" - This subscriber keeps the messsage in the Redis Server and all modifications to the message will be treated like an update in the Redis server. This is considered thesafest way to transport messages since this type of transporation has the most redis guarantees for message integrity.
- "transient" - This subcriber removes the message from the RedisServer and will removes the address from the redis server as well as the message payload. This is considered the least safest way to transport messages since the actual removal of messages introduces a few more cases where the message maybe lost. However, the library takes special care in not letting messages get dropped in most common cases.

## Usage:
Here are a few examples of this library being used:

A *Upstream* publisher that transmits data from the data source to the next hop:
```js
const redisMQConfig = './config/upstream/redismq.config';
const loggerConfig = './config/upstream/logger.config';
const redisMQ = require('redisMQ')
redisMQ.createPublisher(loggerConfig, redisMQConfig, '<Name of Publisher>').then(publisher=> {
  let i = 0
  while (i < 10) {
    var test = { 'testKey1': i, 'testKey2': i,'testKey3': i}
    publisher.sendDirect(test).then(results => console.log('Results: ' + results)).catch(error => console.error('----ERROR: Encountered error:\n\t' + error.message))
    i++
  }
})
.catch(error => console.error('----ERROR: Error encountered while publishing messages. Details:\n\t' + error.message))
```

A *Relay* microservice consumes then transmits data to the next microservice:
```js
const redisMQConfig = './<Path>/<to>/redismq.config';
const loggerConfig = './<Path>/<to>/logger.config';
const redisMQ = require('redisMQ')
redisMQ.createSubscriber(loggerConfig, redisMQConfig, '<Name Of Subscriber>')
  .then(subscriber => {
    this.subscriber = subscriber
    return
  })
  .then(() => redisMQ.createPublisher(loggerConfig, redisMQConfig, '<Name of Publisher>'))
  .then(publisher => {
    this.publisher = publisher
    return
  })
  .then(() => {
        this.subscriber.startConsuming()
          .catch(error => {
            console.error('----ERROR w/ startConsuming() ' + error.message)
          })
        this.subscriber.on('Error', err => {
          console.error('----ERROR: Failed to consume message ' + err)
        })
        this.subscriber.on('MessageReady', (message) => {
          Promise.resolve(message)
            .then(message => {
              console.log('Message Transformed: ' + JSON.stringify(message))
              return message
            })
            .then(message => this.publisher.sendDirect(message))
            .then(results => console.log('Message Sent: ' + results))
            .catch(error => this.subscriber.errorHandler(error, message))
        })
    }
    ).catch(err => {
      console.error('----Module ERROR: ' + err.message)
    })
```

A *Downstream* microservice consumes messages:
```js
const redisMQConfig = '/<Path>/<to>/redismq.config'
const loggerConfig = '/<Path>/<to>/logger.config'
const redisMQ = require('redisMQ')
redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'main.subscriber')
  .then(subscriber => {
    this.subscriber = subscriber
    return
  })
  .then(() => {
    this.subscriber.startConsuming()
      .catch(error => {
        console.error('----ERROR w/ startConsuming() ' + error.message)
      })
    this.subscriber.on('Error', err => {
      console.error('----ERROR: Failed to consume message ' + err)
    })
    this.subscriber.on('MessageReady', (message) => {
      Promise.resolve(message)
        .then(message => console.log('Got Message: ' + JSON.stringify(message)))
        .catch(error => this.subscriber.errorHandler(error, message))
    })
  }).catch(error => {
    console.error('----Module ERROR: ' + error.message)
  })
```
