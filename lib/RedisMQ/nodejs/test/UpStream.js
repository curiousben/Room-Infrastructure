var redisMQConfig = './config/upstream/redismq.config';
var loggerConfig = './config/upstream/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher').then(publisher=> {
  let i = 0
  while (i < 10) {
    var test = { 'testKey1': i, 'testKey2': i,'testKey3': i}
    publisher.sendDirect(test).then(results => console.log('Results: ' + results)).catch(error => console.error('----ERROR: Encountered error:\n\t' + error.message))
    i++
  }
})
.catch(err => console.error('----ERROR: Error caught outside of the lib: ' + err.message))
