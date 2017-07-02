var redisMQConfig = './testConfig/redismq.config';
var loggerConfig = './testConfig/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.init(redisMQConfig, loggerConfig);
var producer = redisMQ.createPublisher('main.publisher')
var test = { 'testKey1': 'testVal1', 'testKey2': 'testVal2','testKey3': 'testVal3'}
var i=0
while (i < 1000) {
  producer.sendDirect(test, function(err, results){
    if (err) {
      console.error('----ERROR: ' + err)
    }
    console.log(results)
    if (i === 99){
      console.log(results)
    }
  })
  i++
}
