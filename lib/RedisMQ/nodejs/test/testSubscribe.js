var redisMQConfig = './testConfig/redismq.config';
var loggerConfig = './testConfig/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.init(redisMQConfig, loggerConfig);
var consumer = redisMQ.createSubscriber('main.subscribe')
consumer.startConsuming()
consumer.on('consumed.message', function(message){
  console.log(message);
})
