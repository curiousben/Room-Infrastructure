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
        this.subscriber.on('MessageReady', message => {
          this.publisher.sendDirect(message).then(res => console.log('Response: ' + res)).catch(err => console.error('CAUGHT!!!' + err.message))
        }) 
      }
    ).catch(err => {
      console.error('ERROR FOUND AND CAUGHT' + err.message)
      throw err
    })
  })
  .catch(error => console.error('Error Encountered: ' + error.stack))
