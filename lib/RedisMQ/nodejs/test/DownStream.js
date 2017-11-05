var redisMQConfig = './config/downstream/redismq.config';
var loggerConfig = './config/downstream/logger.config';
var redisMQ = require('../index.js')
redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'main.subscriber')
  .then(subscriber => {
    this.subscriber = subscriber
    return
  })
  .then(() => {
    this.subscriber.startConsuming()
      .catch(error => {
        throw error
      })
    this.subscriber.on('Error', error => {
      this.subscriber.logger.error(error.message)
    })
    this.subscriber.on('MessageReady', (metaTag, payload) => {
      Promise.resolve(payload)
        .then(payload => {
          this.subscriber.logger.info('Message Transformed by custom logic: ' + JSON.stringify(payload))
          this.subscriber.logger.info('MetaTag Transformed by custom logic: ' + JSON.stringify(metaTag))
          return
        })
        .then(() => this.subscriber.acknowledge(metaTag))
        .then(result => this.subscriber.logger.info('Result: ' + result))
        .catch(error => {
          Promise.resolve()
            .then(() => this.subscriber.logger.error('Processing Error has been encountered. Details:\n' + error.message))
            .then(() => this.subscriber.errorHandler(error, metaTag, payload))
            .catch(handlerError => this.subscriber.logger.error('Error handler encountered an error. Details:\n' + handlerError.message))
        })
    })
  }).catch(error => {
    if (this.subscriber.logger === undefined) {
      console.error('----ERROR: Test Module Error. Details:\n' + error.message)
    } else {
      this.subscriber.logger.error('Test Module Error. Details:\n' + error.message)
    }
  })
