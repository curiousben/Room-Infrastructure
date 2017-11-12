var redisMQConfig = './config/upstream/redismq.config';
var loggerConfig = './config/upstream/logger.config';
var redisMQ = require('redisMQ')
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'main.publisher')
  .then(publisher => {
    this.publisher = publisher
    return
  })
  .then(() => {
    let i = 0
    while (i < 1) {
      const test = {"device": {"3uid": "12345","rssi": "-80"},"node":{"name": "testNode"}}
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
