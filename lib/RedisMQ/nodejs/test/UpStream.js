var redisMQConfig = './config/upstream/redismq.config';
var loggerConfig = './config/upstream/logger.config';
var redisMQ = require('../index.js')
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher')
  .then(publisher => {
    this.publisher = publisher
    return
  })
  .then(() => {
    let i = 0
    while (i < 10000) {
      var test = { 'testKey1': i, 'testKey2': i,'testKey3': i}
      this.publisher.sendDirect(null, test)
        .then(results => this.publisher.logger.info('Results: ' + results))
        .catch(error => console.error('----ERROR: Encountered error:\n\t' + error.message))
      i++
    }
  })
  .catch(error => {
    if (this.publisher.logger == undefined) {
      console.error('----ERROR: Error encountered while publishing test messages. Details:\n\t' + error.message)
    } else {
      this.publisher.logger.error('Error encountered while publishing test messages. Details:\n\t' + error.message)
    }
  })
