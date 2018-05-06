const redisMQ =  require('redisMQ')
const RouterLibrary = require('../lib/index.js')
const redisMQConfig = '/etc/opt/router/redisMQ.config'
const loggerConfig = '/etc/opt/router/logger.config'
const RouterConfig = '/etc/opt/router/router.config'

// Example payload
/*
 * This message does not tranform the data in anyway so the orginal
 * message's data structure remains the same.
 *
*/

// Starting the subscriber
redisMQ.utils.loadJSON(RouterConfig)
  .then(configJSON => RouterLibrary.initRouter(configJSON))
  .then(config => {
    this.routerConfig = config
    return
  })
  .then(() => redisMQ.createPublisher(loggerConfig, redisMQConfig, 'BLERouter'))
  .then(publisher => {
    this.BLETrigger = publisher
    return
  })
  .then(() => redisMQ.createPublisher(loggerConfig, redisMQConfig, 'BLEEvents'))
  .then(publisher => {
    this.BLEEvents = publisher
    return
  })
  .then(() => redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'BLERelay'))
  .then(subscriber => {
    subscriber.startConsuming()
      .catch(error => {
        throw error
      })
    subscriber.on('Error', err => {
      subscriber.logger.error('----ERROR: Failed to consume message ' + err)
    })
    subscriber.on('MessageReady', (metaTag, payload) => {
      Promise.resolve()
        .then(() => RouterLibrary.routerData(payload, this.routerConfig, subscriber.logger))
        .catch(error => {
          subscriber.errorHandler(error, metaTag, payload)
          throw error
        })
        .then(msgIsRoutered => {
          if (msgIsRoutered) {
            return this.BLERouter.sendDirect(null, Object.assign({}, payload))
              .then(results => this.BLERouter.logger.debug('Result from sending router message: ' + results))
              .then(() => this.BLEEvents.sendDirect(metaTag, payload))
              .then(results => this.BLEEvents.logger.debug('Results from sending event message: ' + results))
          } else {
            return this.BLEEvents.sendDirect(metaTag, payload)
              .then(results => this.BLEEvents.logger.debug('Results from sending event message: ' + results))
          }
        })
        .catch(error => {
          subscriber.logger.error('Failed to send BLE event message. Details:\n ' + error.name + ': ' + error.message)
        })
      })
  }).catch(err => {
    if (this.subscriber.logger === undefined) {
      console.error('----Error: Module error has occured ' + err.name + ': ' + err.message)
    } else {
      this.subscriber.logger.error('Module error has occured ' + err.name + ': ' + err.message)
    }
  })
