var redisMQConfig = './config/relay/redismq.config';
var loggerConfig = './config/relay/logger.config';
var redisMQ = require('../redisMQ.js')
/*
Promise.all([redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'main.subscriber'), redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher')])
  .then(init => {
    let subscriber = init[0]
    let publisher = init[1]
    subscriber.startConsuming()
    subscriber.on('MessageReady', message => {
      publisher.sendDirect(message)
    })
  })
*/

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
    new Promise(
      (resolve, reject) => {
        this.subscriber.startConsuming()
        this.subscriber.on('Error', err => {
          console.error('----ERROR: Failed to consume message ' + err)
        })
        this.subscriber.on('MessageReady', (message) => {
          Promise.resolve(message)
            .then(message => {
              console.log('Message Received: ' + JSON.stringify(message))
              throw new Error('Test Error!!!')
              return message
            })
            .then(message => this.publisher.sendDirect(message))
            .then(results => console.log('Message Sent: ' + results))
            .catch(error => this.subscriber.errorHandler(error, message))
        })
        
      }
    ).catch(err => {
      console.error('ERROR FOUND AND CAUGHT' + err.message)
      throw err
    })
  })
  .catch(error => console.error('Error Encountered: ' + error.stack))
