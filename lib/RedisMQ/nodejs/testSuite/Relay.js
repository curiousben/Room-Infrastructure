var redisMQConfig = './config/relay/redismq.config';
var loggerConfig = './config/relay/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'main.subscriber')
  .then(subscriber => {
    subscriber.startConsuming()
    subscriber.on('MessageReady', message => {
      console.log(message)
    })
  })
  .catch(error => console.error('Error Encountered: ' + error.stack))
