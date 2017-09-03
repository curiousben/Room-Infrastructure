var redisMQConfig = './config/upstream/redismq.config';
var loggerConfig = './config/upstream/logger.config';
var redisMQ = require('../index.js')
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher').then(publisher=> {
  let i = 0
  while (i < 10) {
    var test = { 'testKey1': i, 'testKey2': i,'testKey3': i}
    publisher.sendDirect(test).then(results => console.log('Results: ' + results)).catch(error => console.error('----ERROR: Encountered error:\n\t' + error.message))
    i++
  }
})
.catch(error => console.error('----ERROR: Error encountered while publishing messages. Details:\n\t' + error.message))
