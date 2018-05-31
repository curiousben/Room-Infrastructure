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
let aggPublisher = null
let aggSubscriber = null

// Starting the subscriber
redisMQ.utils.loadJSON(aggregatorConfig)
  .then(configJSON => aggCache.initCache(configJSON))
  .then(config => {
    this.filterConfig = config
    return
  })
  .then(() => redisMQ.createPublisher(loggerConfig, redisMQConfig, 'WemoService'))
  .then(newPublisher => {
    aggPublisher = newPublisher
    return
  })
  .then(() => redisMQ.createSubscriber(loggerConfig, redisMQConfig, 'BLEFilter'))
  .then(newSubscriber => {
    aggSubscriber = newSubscriber

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

    // Need a way to Nack this message so the flush might need to the send the message through
    aggCache.on('FLUSH', function (cacheEventType, cacheEventStatus, cacheData) {
      if ('ObjectEventFlush' === cacheEventType && 'OK' === cacheEventStatus) {
        Promise.resolve()
          .then(() => {
            Object.keys(cacheData).forEach(bleUUID => {
              aggPublisher.sendDirect(null, bleUUID)
                .then(results => {
                  for (const [key, value] of Object.entries(cacheData[bleUUID])) {
                    aggSubscriber.ack(value['metaTag'])
                  }
                })
                .catch(error => {
                  throw error
                })
            })
          })
          .catch(error => {
            throw error
          })
      }
    })

    // Need a way to Nack this message so the flush might need to the send the message through
    aggSubscriber.on('Error', err => {
      subscriber.logger.error(utils.format('Failed to consume message, details: %s', err))
    })

    aggSubscriber.on('MessageReady', (metaTag, payload) => {
      Promise.resolve()
        .then(() => aggCache.processRecord(aggSubscriber.logger, payload, payload['UUID'], payload['node'])
        .catch(error => {
          aggSubscriber.errorHandler(error, metaTag, payload)
          throw error
        })
        .catch(error => {
          subscriber.logger.error(util.format('Failed to process event for Aggregation. Details: %s: %s', error.name, error.message))
        })
      })

    aggSubscriber.startConsuming()
      .catch(error => {
        throw error
      })
  }).catch(err => {
    if (aggSubscriber.logger === undefined) {
      console.error(util.format('----Error: Module error has occured %s: %s', err.name, err.message))
    } else {
      aggSubscriber.logger.error(util.format('Module error has occured %s: %s', err.name, err.message))
    }
  })

