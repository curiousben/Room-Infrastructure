var redisMQConfig = './config/downstream/redismq.config';
var loggerConfig = './config/downstream/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'main.subscriber')
  .then(subscriber => {
    subscriber.startConsuming().catch(error => {
      console.error('----ERROR: Failed to start consumeing in Microservice')
    })
    subscriber.on('MessageReady', message => {
      console.log('Consumed message: ' + JSON.stringify(message))
    })
  }).catch(error => console.error('Encountered Error at Downstream' + error.message))
