var redisMQConfig = './testConfig/microservice2/redismq.config';
var loggerConfig = './testConfig/microservice2/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.init(redisMQConfig, loggerConfig);
var consumer = redisMQ.createSubscriber('RedisConnector.Raw.Data')
consumer.startConsuming()
consumer.on('MessageReady', function(message){
  console.log(message);
})
