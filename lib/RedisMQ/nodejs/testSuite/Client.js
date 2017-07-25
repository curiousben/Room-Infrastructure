var redisMQConfig = './config/client/redismq.config';
var loggerConfig = './config/client/logger.config';
var redisMQ = require('../redisMQ.js')
var producer = redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher')
console.log("----SUCCESS: Client created");
