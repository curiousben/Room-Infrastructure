var redisMQConfig = './config/client/redismq.config';
var loggerConfig = './config/client/logger.config';
var redisMQ = require('../index.js')
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher').then(publisher=> {
  console.log('Resolution for Promise is:\n\t' + Object.keys(publisher))
}).catch(err => console.error('----ERROR: Error caught outside of the lib: ' + err.message))
