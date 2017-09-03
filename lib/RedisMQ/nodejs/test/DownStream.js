var redisMQConfig = './config/downstream/redismq.config';
var loggerConfig = './config/downstream/logger.config';
var redisMQ = require('../index.js')
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
        console.error('----ERROR w/ startConsuming() ' + error.message)
      })
      this.subscriber.on('Error', err => {
        console.error('----ERROR: Failed to consume message ' + err)
      })
      this.subscriber.on('MessageReady', (message) => {
        Promise.resolve(message)
          .then(message => console.log('Got Message: ' + JSON.stringify(message)))
          //.then(message => this.publisher.sendDirect(message))
          //.then(results => console.log('Message Sent: ' + results))
          .catch(error => this.subscriber.errorHandler(error, message))
      })
    }).catch(error => {
      console.error('----Module ERROR: ' + error.message)
    })
