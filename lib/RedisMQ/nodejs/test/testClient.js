var redisMQConfig = './testConfig/redismq.config';
var loggerConfig = './testConfig/logger.config';
var redisMQ = require('../redisMQ.js')
redisMQ.init(redisMQConfig, loggerConfig);
var producer = redisMQ.createPublisher('main.publisher')
console.log("----SUCCESS: Client created");
