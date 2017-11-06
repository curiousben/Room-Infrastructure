# Supported tags and respective `Dockerfile` links

 - `1.0` [(1.0/library)](https://github.com/curiousben/Room-Infrastructure/blob/master/lib/RedisMQ/nodejs/docker-amd/1.0/Dockerfile)
 - `1.5` [(1.5/library)](https://github.com/curiousben/Room-Infrastructure/blob/master/lib/RedisMQ/nodejs/docker-amd/1.5/Dockerfile)

# Quick reference


- **Where to get help**:  
  Email is best and only way outside of the guide to get help [benjamindsmith3@gmail.com](benjamindsmith3@gmail.com). As always suggestions are very welcome.

- **Where to file issues**:  
  [https://github.com/curiousben/Room-Infrastructure/issues](https://github.com/curiousben/Room-Infrastructure/issues)

- **Maintained by**:  
  [Benjamin Smith](https://www.linkedin.com/in/ben-d-smith/) (A message based microservice middleware engineer)

- **Supported architectures**: `amd64`

- **Source of this description**:  
  [The `/README.md` in the root directory](https://github.com/curiousben/Room-Infrastructure/blob/master/lib/RedisMQ/nodejs/docker-amd/1.5/README.md)
  
# What is RedisMQ?

A simple message based library that can transport messages using Redis lists and native Node.js ES6 Promises. The guarantees that this library makes are limited to the guarantees that Redis gives to data integrity. The main motivation for this project was to explore the assumptions that message brokers have to make in order to guarantee message integrity, also how to write a Node.js library.

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
        "queue":""
      },
      "errorMessage": {
        "queue":""
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
      "queue":""
    }
  }
}
```
Note:
- Having both a producer and subscriber is not enforced but you must make sure you have at least one of them configured. If not an error will be thrown.

### Publisher:

> The main responibility for the producer is to create redisMQ messages according to the microservice logic and configuration. The publisher as of (Nov 5, 2017) can only publish to one queue. Users have the ability to define any amount of publishers as long as they exist in the publisher's section of the redisMQ configuration. In the future, there will be an effort to expand this to include publishing to multiple queues, known as a fan out message pattern.


#### Methods:

The publisher as of (Nov 5, 2017) has a few different methods:
- sendDirect: This promise takes a payload and a metaTag and publishes a message a redis queue.
### Subscriber:

> Generally the subscriber's responsiblities include reporting issues with the microservice process and  making sure that the microservice process has been completed and the message in the process queue has been processed

#### Methods:
The subscriber as of (Nov 5, 2017) has a few different methods:
- errorHandler: This promise consumes the error that has been thrown in the microservice and sends the error's descirption to the notification queue and moves the message that has failed to the error queue.
- acknowledge: This promise takes the metaTag about the RedisMQ message and deletes it from the processing queue indicating that the message has been processed successfully. This new addition now allows message aggregation pattern to be supported.

## Usage:
Here are a few examples of this library being used:

A *Upstream* publisher that transmits data from the data source to the next hop:

```js
const redisMQConfig = './<Path>/<to>/redismq.config';
const loggerConfig = './<Path>/<to>/logger.config';
const redisMQ = require('redisMQ')
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher')
  .then(publisher => {
    this.publisher = publisher
    return
  })
  .then(() => {
    let i = 0
    while (i < 10) {
      var test = { 'testKey1': i, 'testKey2': i,'testKey3': i}
      this.publisher.sendDirect(null, test)
        .then(results => this.publisher.logger.info('Results: ' + results))
        .catch(error => console.error('----ERROR: Encountered error:\n\t' + error.message))
      i++
    }
  })
  .catch(error => {
    if (this.publisher.logger == undefined) {
      console.error('----ERROR: Error encountered while publishing test messages. Details:\n\t' + error.message)
    } else {
      this.publisher.logger.error('Error encountered while publishing test messages. Details:\n\t' + error.message)
    }
  })

```

A *Relay* microservice consumes then transmits data to the next microservice:

```js
const redisMQConfig = './<Path>/<to>/redismq.config';
const loggerConfig = './<Path>/<to>/logger.config';
const redisMQ = require('redisMQ')
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher')
  .then(publisher => {
    this.publisher = publisher
    return
  })
  .then(() => redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'main.subscriber'))
  .then(subscriber => {
    this.subscriber =subscriber
    return
  })
  .then(() => {
    this.subscriber.startConsuming()
      .catch(error => {
        throw error
      })
    this.subscriber.on('Error', error => {
      this.subscriber.logger.error(error.message)
    })
    this.subscriber.on('MessageReady', (metaTag, payload) => {
      Promise.resolve(payload)
        .then(payload => {
          this.subscriber.logger.info('Message Transformed by custom logic: ' + JSON.stringify(payload))
          this.subscriber.logger.info('MetaTag Transformed by custom logic: ' + JSON.stringify(metaTag))
          return payload
        })
        .then(payload => this.publisher.sendDirect(metaTag, payload))
        .then(results => this.subscriber.logger.info('Message Sent: ' + results))
        .catch(error => {
          Promise.resolve()
            .then(() => this.subscriber.logger.error('Processing Error has been encountered. Details:\n' + error.message))
            .then(() => this.subscriber.errorHandler(error, metaTag, payload))
            .catch(handlerError => this.subscriber.logger.error('Error handler encountered an error. Details:\n' + handlerError.message))
        })
    })
  }).catch(error => {
    if (this.subscriber.logger === undefined) {
      console.error('----ERROR: Test Module Error. Details:\n' + error.message)
    } else {
      this.subscriber.logger.error('Test Module Error. Details:\n' + error.message)
    }
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
        throw error
      })
    this.subscriber.on('Error', error => {
      this.subscriber.logger.error(error.message)
    })
    this.subscriber.on('MessageReady', (metaTag, payload) => {
      Promise.resolve(payload)
        .then(payload => {
          this.subscriber.logger.info('Message Transformed by custom logic: ' + JSON.stringify(payload))
          this.subscriber.logger.info('MetaTag Transformed by custom logic: ' + JSON.stringify(metaTag))
          return
        })
        .then(() => this.subscriber.acknowledge(metaTag))
        .then(result => this.subscriber.logger.info('Result: ' + result))
        .catch(error => {
          Promise.resolve()
            .then(() => this.subscriber.logger.error('Processing Error has been encountered. Details:\n' + error.message))
            .then(() => this.subscriber.errorHandler(error, metaTag, payload))
            .catch(handlerError => this.subscriber.logger.error('Error handler encountered an error. Details:\n' + handlerError.message))
        })
    })
  }).catch(error => {
    if (this.subscriber.logger === undefined) {
      console.error('----ERROR: Test Module Error. Details:\n' + error.message)
    } else {
      this.subscriber.logger.error('Test Module Error. Details:\n' + error.message)
    }
  })
```
