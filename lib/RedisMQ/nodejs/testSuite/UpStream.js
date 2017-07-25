var redisMQConfig = './config/upstream/redismq.config';
var loggerConfig = './config/upstream/logger.config';
var redisMQ = require('../redisMQ.js')
var producer = redisMQ.createPublisher(loggerConfig, redisMQConfig,'main.publisher')
var i=0
while (i < 5) {
  var test = { 'testKey1': i, 'testKey2': i,'testKey3': i}
  producer.sendDirect(test, function(err, results){
    if (err) {
      console.error('----ERROR: ' + err)
    }
    console.log(results)
    if (i === 4){
      console.log(results)
    }
  })
  i++
}
