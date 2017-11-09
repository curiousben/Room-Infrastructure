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
    subscriber.on('MessageReady', message => {
      Promise.resolve(message)
        .then(message => this.BLEEvents.sendDirect(message))
        .then(() => FilterLibrary.filterData(message, this.filterConfig, subscriber.logger))
        .then(msgIsFiltered => {
          if (msgIsFiltered) {
            this.BLETrigger.sendDirect(message)
              .then(result => this.BLETrigger.logger.debug('Result from the message:\n' + JSON.stringify(message, null, 2) + '\n was sent'))
              .catch(error => this.BLETrigger.logger.error('Failed to send message. Details: ' + error.message))
          }
        })
      })
  }).catch(err => {
    console.error('----Module ERROR: ' + err.message)
  })
