const redisMQ =  require('redisMQ')
const FilterLibrary = require('../lib/index.js')
const redisMQConfig = '/etc/opt/filter/redisMQ.config'
const loggerConfig = '/etc/opt/filter/logger.config'
const FilterConfig = '/etc/opt/filter/filter.config'

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
        .then(() => FilterLibrary.filterData(payload, this.filterConfig, subscriber.logger))
        .catch(error => {
          subscriber.errorHandler(error, metaTag, payload)
          throw error
        })
        .then(msgIsFiltered => {
          if (msgIsFiltered) {
            return this.BLEFilter.sendDirect(null, Object.assign({}, payload))
              .then(results => this.BLEFilter.logger.debug('Result from sending filter message: ' + results))
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
