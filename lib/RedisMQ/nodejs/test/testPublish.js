var redisMQConfig = './testConfig/redismq.config';
var loggerConfig = './testConfig/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.init(redisMQConfig, loggerConfig);
var producer = redisMQ.createPublisher('main.publisher')
var test = { 'testKey1': 'testVal1', 'testKey2': 'testVal2','testKey3': 'testVal3'}
var i=0
while (i < 100) {
  producer.send(test, function(err, results){
    console.log(results)
  })
  i++
}
