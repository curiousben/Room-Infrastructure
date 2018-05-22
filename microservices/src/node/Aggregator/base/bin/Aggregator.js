'use strict'

const redisMQ =  require('redisMQ')
const Aggregator = require('../index.js')
const redisMQConfig = '/etc/opt/Aggregator/redisMQ.config'
const loggerConfig = '/etc/opt/Aggregator/logger.config'
const aggregatorConfig = '/etc/opt/Aggregator/Aggregator.config'
const util = require('util')

// Example payload
/*
 * This Microservice stores messages in cache and 
 * when an event is received that fulfills the caches
 * requirements then the cache flushes its contents
 *
*/

let aggCache = new Aggregator()

// Starting the subscriber
redisMQ.utils.loadJSON(aggregatorConfig)
  .then(configJSON => aggCache.initCache(configJSON))
  .then(config => {
    this.filterConfig = config
    return
  })
  .then(() => redisMQ.createPublisher(loggerConfig, redisMQConfig, 'WemoService'))
  .then(publisher => {
    this.BLETrigger = publisher
    return
  })
  .then(() => redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'BLEFilter'))
  .then(subscriber => {
    subscriber.startConsuming()
      .catch(error => {
        throw error
      })
    subscriber.on('Error', err => {
      subscriber.logger.error(utils.format('Failed to consume message, details: %s', err))
    })

    aggCache.on('INSERT', function (cacheEventType, cacheEventStatus, cacheData) {
      if ('ObjectCacheUpdate' === cacheEventType && 'OK' === cacheEventStatus) {
        let metaTag = JSON.parse(cacheData)['metaTag']
        subscriber.acknowledge(metaTag)
        subscriber.logger.debug(util.format("The message %s has been acked", cacheData))
      }
      if ('ObjectCacheInsert' === cacheEventType && 'OK' === cacheEventStatus) {
        subscriber.logger.debug(util.format("The message %s has been placed in the cache", cacheData))
      }
    })

    aggCache.on('ERROR', function (errorEventType, errorDesc, cacheData) {
      let metaTag = JSON.parse(cacheData)['metaTag']
      subscriber.errorHandler(error, metaTag, null)
      subscriber.logger.error(utils.format('Aggreator cache encountered an %s error , details %s', errorDesc))
    })

    aggCache.on('FLUSH', function (cacheEventType, cacheEventStatus, cacheData) {
      if ('ObjectEventFlush' === cacheEventType && 'OK' === cacheEventStatus) {
        Promise.resolve()
          .then(() => {

          })
      }
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

