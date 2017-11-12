const redisMQ =  require('redisMQ')
const FilterLibrary = require('../lib/index.js')
const redisMQConfig = './config/filtertest/redisMQ.config'
const loggerConfig = './config/filtertest/logger.config'
const FilterConfig = './config/filtertest/filter.config'

// Example payload
/*
 * This message does not tranform the data in anyway so the orginal
 * message's data structure remains the same.
 *
*/
// Starting the subscriber
redisMQ.utils.loadJSON(FilterConfig)
  .then(configJSON => FilterLibrary.initFilter(configJSON))
  .then(config => {
    this.filterConfig = config
    return
  })
  .then(() => redisMQ.createPublisher(loggerConfig, redisMQConfig, 'BLEFilter'))
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
        .then(() => this.BLEEvents.sendDirect(Object.assign({}, metaTag), Object.assign({}, payload)))
        .then(results => this.BLEEvents.logger.debug('Result from sending message: ' + results))
        .then(() => FilterLibrary.filterData(payload, this.filterConfig, subscriber.logger))
        .then(msgIsFiltered => {
          if (msgIsFiltered) {
            this.BLETrigger.sendDirect(null, payload)
              .then(result => this.BLETrigger.logger.debug('Result from sending message: ' + result ))
              .catch(error => this.BLETrigger.logger.error('Failed to send trigger message. Details: ' + error.name + error.message))
          }
        })
        .catch(error => subscriber.logger.error('Failed to send BLE event message. Details:\n ' + error.name + ': ' + error.message))
      })
  }).catch(err => {
    console.error('----Module ERROR: ' + err.name + ': ' + err.message)
  })
