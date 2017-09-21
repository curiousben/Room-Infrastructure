const redisMQ =  require('redisMQ')
const bleTriangulation = require('../lib/BLETriangulation.js')
const triangulationConfig = '../config/triangulation.config'
const redisMQConfig = '../config/redismq.config'
const loggerConfig = '../config/logger.config'

// Starting the producer 
redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'main.subscriber')
  .then(subscriber => {
    this.subscriber = subscriber
    return
  })
  .then(() => redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher'))
  .then(publisher => {
    this.publisher = publisher
    return
  })
  .then(() => {
    this.subscriber.startConsuming()
      .catch(error => {
        throw new Error('----ERROR w/ startConsuming() ' + error.message)
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
  }).catch(err => {
    console.error('----Module ERROR: ' + err.message)
  })
