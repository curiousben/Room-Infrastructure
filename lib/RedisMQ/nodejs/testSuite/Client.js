var redisMQConfig = './config/client/redismq.config';
var loggerConfig = './config/client/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher').then(publisher=> {
  console.log('Resolution for Promise is:\n\t' + publisher)
}).catch(err => console.error('----ERROR: Error caught outside of the lib: ' + err.message))
