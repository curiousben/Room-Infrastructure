const redisMQ =  require('redisMQ')
const FilterLibrary = require('../lib/Filter_Lib.js')
const redisMQConfig = '/etc/opt/BLERelay/redisMQ.config'
const loggerConfig = '/etc/opt/BLERelay/logger.config'
const FilterConfig = '/etc/opt/BLERelay/Filter.config'

// Example payload
/*
 * {
 *   "device": {
 *     "uuid": "",
 *     "rssi": ""
 *   },
 *   "node": {
 *     "name": ""
 *   }
 * }
 *
*/
// Starting the subscriber
redisMQ.loadJSON(FilterConfig)
  .then(configJSON => FilterLibrary.initFilter(configJSON))
  .then(config => {
    this.filterConfig = config
    return
  })
  .then(() => redisMQ.createPublisher(loggerConfig, redisMQConfig, 'BLETrigger'))
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
    subscriber.on('MessageReady', message => {
      Promise.resolve(message)
        .then(message => this.BLEEvents.sendDirect(message))
        .then(() => FilterLibrary.filterData(message, this.filterConfig, subscriber.logger))
        .then(msgIsFiltered => {
          if (msgIsFiltered) {
            this.BLETrigger.sendDirect(message)
              .then(result => this.BLETrigger.logger.debug('Result from message sent: ' + result))
              .catch(error => this.BLETrigger.logger.error('Failed to send message. Details: ' + error.message))
          }
        })
      })
  }).catch(err => {
    console.error('----Module ERROR: ' + err.message)
  })
