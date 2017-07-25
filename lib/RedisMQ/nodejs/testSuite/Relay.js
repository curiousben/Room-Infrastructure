var redisMQConfig = './config/relay/redismq.config';
var loggerConfig = './config/relay/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.init(redisMQConfig, loggerConfig);
var consumer = redisMQ.createSubscriber('main.subscriber')
consumer.startConsuming()
consumer.on('MessageReady', function(message){
  console.log(message);
})
