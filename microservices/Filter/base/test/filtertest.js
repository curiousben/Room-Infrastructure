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
    this.BLEFilter = publisher
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
            // Custom logic to handle non-filtered out data
            return this.BLEFilter.sendDirect(metaTag, Object.assign({}, payload))
              .then(results => this.BLEFilter.logger.debug('Result from sending filter message: ' + results))
              .catch(error => this.BLEFilter.logger.error('Error encountered: ' + results))
          } else {
            // Custom logic to handle filtered out data
            return subscriber.acknowledge(metaTag)
          }
        })
        .catch(error => {
          subscriber.logger.error('Failed to send BLE event message. Details:\n ' + error.name + ': ' + error.message)
        })
      })
  }).catch(err => {
    console.error('----Module ERROR: ' + err.name + ': ' + err.message)
  })
