const redisMQConfig = './config/client/redismq.config';
const loggerConfig = './config/client/logger.config';
const redisMQ = require('../index.js')
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher')
  .then(publisher=> {
    console.log('Publisher has been created!:\n\t' + Object.keys(publisher))
  })
  .then(() => redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'main.subscriber'))
  .then(subscriber => {
    console.log('Subscriber has been created!:\n\t' + Object.keys(subscriber))
  }).catch(err => console.error('----ERROR: Error caught outside of the lib: ' + err.message))
