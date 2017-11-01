# Supported tags and respective `Dockerfile` links

 - `1.0` [(1.0/library)](https://github.com/curiousben/Room-Infrastructure/blob/master/lib/RedisMQ/nodejs/docker-amd/1.0/Dockerfile)

# Quick reference


- **Where to get help**:  
  Email is best and only way outside of the guide to get help [benjamindsmith3@gmail.com](benjamindsmith3@gmail.com). As always suggestions are very welcome.

- **Where to file issues**:  
  [https://github.com/curiousben/Room-Infrastructure/issues](https://github.com/curiousben/Room-Infrastructure/issues)

- **Maintained by**:  
  [Benjamin Smith](https://www.linkedin.com/in/ben-d-smith/) (A message based microservice middleware engineer)

- **Supported architectures**: `amd64`

- **Source of this description**:  
  [The `/README.md` in the root directory](https://github.com/curiousben/Room-Infrastructure/blob/master/lib/RedisMQ/nodejs/docker-amd/README.md)
  
# What is RedisMQ?

A simple message based library that can transport messages using Redis lists and native Node.js ES7 Promises. The guarantees that this library makes are limited to the guarantees that Redis gives to data integrity. The main motivation for this project was to explore the assumptions that message brokers have to make in order to guarantee message integrity, also how to write a Node.js library.

# How to use this image

## Building Microservices on top of this image

The most upstream parent image for this docker image is Debian with Node.js and RedisMQ being installed with curl and gnupg2 being installed for Node.js. This creates a template for other custom node.js programs to be created on top of this image and not have to worry about installation. 

# A quick introduction to how to use RedisMQ

The following is a quick introduction to how to use the RedisMQ library in a Node.js application.

## Configuration

The general configuration for RedisMQ is as follows:

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
- Having both a producer and subscriber is not enforced but you must make sure you have at least one of them configured.

### Publisher:

> The publisher as of (Sept 6, 2017) can only publish to one queue. Users have the ability to define any amount of publishers as long as they exist in the publisher's section of the redisMQ configuration. In the future, there will be an effort to expand this to include publishing to multiple queues.

### Subscriber:
The subscriber as of (Sept 6, 2017) can be of two types:
- "persistent" - This subscriber keeps the message in the Redis Server and all modifications to the message will be treated like an update in the Redis server. This is considered the safest way to transport messages since this type of transportation has the most Redis guarantees for message integrity.
- "transient" - This subscriber removes the message and metadata from the Redis Server. This is considered the least safest way to transport messages since the actual removal of messages introduces a few more cases where the message may be lost. However, the library takes special care in not letting messages get dropped in the most common cases.

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
