var redisMQConfig = './testConfig/microservice1/redismq.config';
var loggerConfig = './testConfig/microservice1/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.init(redisMQConfig, loggerConfig);
var producer = redisMQ.createPublisher('BLERelay.Redis')
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
