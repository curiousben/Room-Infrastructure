/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict'

/*
* Module design:
*   This module will be responsible for initializing the correct cache and subsequent methods for interacting
*   with the cache that this microservice is responsible for. The object that will be returned will be the
*   cache (for the internal or external) and methods for interacting with.
*
* Interface:
*   This interface has a response structure that all calls will adhere to. This will removes the responsiblity of the interface having to know how to react to an overfilled cache, misconfiguration, or common responses.
*   This follows a simliar design model of how a microservice should interact with an external endpoint.
*   The following will the be the data structure that is returned after a request is made to the internal data structure:
*     Event:
*       'ERROR':
*         Variable:
*           (1) - 'TypeOfEventFailure'
*           (2) - 'Status'
*           (3) - 'ErrorMessage'
*           (4) - 'Message'
*       'FLUSH':
*         Variable:
*           (1) - 'FlushType'
*           (2) - 'Status'
*           (3) - 'ResponsePayload'
*       'INSERT':
*         Variable:
*           (1) - 'InsertType'
*           (2) - 'Status'
*           (3) - 'ResponsePayload'
*/

const internalCache = require('./cacheStructure/internal/init.js')
const externalCache = require('./cacheStructure/external/init.js')
const arrayCacheInterface = require('./cacheInterface/arrayCache.js')
const objectCacheInterface = require('./cacheInterface/objectCache.js')
const AggregatorError = require('./errors/aggregatorError.js')
const InitializationError = require('./errors/initializationError.js')
const cacheUtilities = require('./utilities/initialize.js')
const EventEmitter = require('events')
const util = require('util')

function cacheInterface () {
  EventEmitter.call(this)

  let storageStrategy = null
  let storagePolicyArchiveBy = null
  let cache = Object.create()

  /*
  * Description:
  *
  * Args:
  *
  * Returns:
  *
  * Throws:
  *
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  let singleTimeCache = (logger, cacheInst, primaryEventData, record) => {
    return Promise.resolve()
      .then(() => arrayCacheInterface.isCacheEmpty(logger, cacheInst.properties.sizeOfCache))
      .then(isCacheEmpty => {
        if (isCacheEmpty) {
          return arrayCacheInterface.addEntryToTimeCache(logger, cacheInst, primaryEventData, record)
            .then(() => {
              this.emit('INSERT', 'ArrayCacheCreate', 'OK', null)
            })
            .catch(error => {
              throw error
            })
        } else {
          return arrayCacheInterface.hasPrimaryEntry(logger, cacheInst.cache, primaryEventData)
            .then(hasPrimaryEntry => {
              if (hasPrimaryEntry) {
                return arrayCacheInterface.updateEntryToTimeCache(logger, cacheInst, primaryEventData, record)
                  .then(() => {
                    this.emit('INSERT', 'ArrayCacheUpdate', 'OK', null)
                  })
                  .catch(error => {
                    throw error
                  })
              } else {
                return arrayCacheInterface.flushTimeCache(logger, cacheInst, primaryEventData)
                  .then(finalCache => {
                    this.emit('FLUSH', 'EventFlush', 'OK', finalCache)
                  })
                  .then(() => arrayCacheInterface.addEntryToTimeCache(logger, cacheInst, primaryEventData, record))
                  .then(() => {
                    this.emit('INSERT', 'ArrayCacheCreate', 'OK', null)
                  })
              }
            })
        }
      })
      .then(() => arrayCacheInterface.doesCacheNeedFlush(logger, cacheInst))
      .then(doesCacheNeedFlush => {
        if (doesCacheNeedFlush) {
          return arrayCacheInterface.flushCache(logger, cacheInst)
            .then(cacheObj => {
              this.emit('FLUSH', 'CacheFlush', 'OK', cacheObj)
            })
            .catch(error => {
              throw error
            })
        } else {
          return arrayCacheInterface.doesCacheTimeNeedFlush(logger, cacheInst, primaryEventData)
            .then(doesCacheTimeNeedFlush => {
              if (doesCacheTimeNeedFlush) {
                return arrayCacheInterface.flushTimeCache(logger, cacheInst, primaryEventData)
                  .then(finalCache => {
                    this.emit('FLUSH', 'EventFlush', 'OK', finalCache)
                  })
                  .catch(error => {
                    throw error
                  })
              }
            })
            .catch(error => {
              throw error
            })
        }
      })
      .catch(error => {
        this.emit('ERROR', 'SingleEventArrayCacheError', 'ERROR', util.format('Failed to process the data event for the cache %s. Details: %s', primaryEventData, error.message), record)
      })
  }

  /*
  * Description:
  *
  * Args:
  *
  * Returns:
  *
  * Throws:
  *
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  let multiTimeCache = (logger, cacheInst, primaryEventData, record) => {
    return Promise.resolve()
      .then(() => arrayCacheInterface.hasPrimaryEntry(logger, cacheInst.cache, primaryEventData))
      .then(hasPrimaryEntry => {
        if (hasPrimaryEntry) {
          return arrayCacheInterface.updateEntryToTimeCache(logger, cacheInst, primaryEventData, record)
            .then(() => {
              this.emit('INSERT', 'ArrayCacheUpdate', 'OK', null)
            })
            .catch(error => {
              throw error
            })
        } else {
          return arrayCacheInterface.addEntryToTimeCache(logger, cacheInst, primaryEventData, record)
            .then(() => {
              this.emit('INSERT', 'ArrayCacheCreate', 'OK', null)
            })
            .catch(error => {
              throw error
            })
        }
      })
      .then(() => arrayCacheInterface.doesCacheNeedFlush(logger, cacheInst))
      .then(doesCacheNeedFlush => {
        if (doesCacheNeedFlush) {
          return arrayCacheInterface.flushCache(logger, cacheInst)
            .then(cacheObj => {
              this.emit('FLUSH', 'CacheFlush', 'OK', cacheObj)
            })
            .catch(error => {
              throw error
            })
        } else {
          return arrayCacheInterface.doesCacheTimeNeedFlush(logger, cacheInst, primaryEventData)
            .then(doesCacheTimeNeedFlush => {
              if (doesCacheTimeNeedFlush) {
                return arrayCacheInterface.flushTimeCache(logger, cacheInst, primaryEventData)
                  .then(finalCache => {
                    this.emit('FLUSH', 'EventFlush', 'OK', finalCache)
                  })
                  .catch(error => {
                    throw error
                  })
              }
            })
            .catch(error => {
              throw error
            })
        }
      })
      .catch(error => {
        this.emit('ERROR', 'MultiEventArrayCacheError', util.format('Failed to process the data event for the cache %s. Details: %s', primaryEventData, error.message), record)
      })
  }

  /*
  * Description:
  *
  * Args:
  *
  * Returns:
  *
  * Throws:
  *
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  let singleSecondaryCache = (logger, cacheInst, primaryEventData, objectEventData, record) => {
    return Promise.resolve()
      .then(() => objectCacheInterface.isCacheEmpty(logger, cacheInst.properties.sizeOfCache))
      .then(isCacheEmpty => {
        if (isCacheEmpty) {
          // Cache is empty so add the new record
          return objectCacheInterface.addEntryToObjectCache(logger, cacheInst, primaryEventData, objectEventData, record)
            .then(() => {
              this.emit('INSERT', 'ObjectCacheInsert', 'OK', null)
            })
            .catch(error => {
              throw error
            })
        } else {
          return objectCacheInterface.hasSecondaryEntry(logger, cacheInst.cache, primaryEventData, objectEventData)
            .then(hasSecondaryEntry => {
              if (hasSecondaryEntry) {
                // Cache is not empty so add and has data for the object cache
                return objectCacheInterface.updateEntryToObjectCache(logger, cacheInst, primaryEventData, objectEventData, record)
                  .then(oldRecord => {
                    this.emit('INSERT', 'ObjectCacheUpdate', 'OK', oldRecord)
                  })
                  .catch(error => {
                    throw error
                  })
              } else {
                return objectCacheInterface.hasPrimaryEntry(logger, cacheInst, primaryEventData)
                  .then(hasPrimaryEntry => {
                    if (hasPrimaryEntry) {
                      // Doesn't have object cache primary Event but has the primary event so implies another secondary event just add
                      return objectCacheInterface.addEntryToObjectCache(logger, cacheInst, primaryEventData, objectEventData, record)
                        .then(() => {
                          this.emit('INSERT', 'ObjectCacheInsert', 'OK', null)
                        })
                        .catch(error => {
                          throw error
                        })
                    } else {
                      // Doesn't have secondary Event and doesn't have the primary event so this implies another primary
                      // event has been encountered flush cache
                      return objectCacheInterface.flushSecondaryEventCache(logger, cacheInst, primaryEventData)
                        .then(finalCache => {
                          this.emit('FLUSH', 'EventFlush', 'OK', finalCache)
                        })
                        .then(() => objectCacheInterface.addEntryToObjectCache(logger, cacheInst, primaryEventData, objectEventData, record))
                        .then(() => {
                          this.emit('INSERT', 'ObjectCacheInsert', 'OK', null)
                        })
                        .catch(error => {
                          throw error
                        })
                    }
                  })
              }
            })
        }
      })
      .then(() => objectCacheInterface.doesCacheNeedFlush(logger, cacheInst))
      .then(doesCacheNeedFlush => {
        if (doesCacheNeedFlush) {
          return objectCacheInterface.flushCache(logger, cacheInst)
            .then(cacheObj => {
              this.emit('FLUSH', 'CacheFlush', 'OK', cacheObj)
            })
            .catch(error => {
              // Could result in endless loop with new messages possibliy triggering new error events never empting the cache
              throw error
            })
        } else {
          return objectCacheInterface.doesCacheSecondaryNeedFlush(logger, cacheInst, primaryEventData, objectEventData)
            .then(doesCacheSecondaryNeedFlush => {
              if (doesCacheSecondaryNeedFlush) {
                return objectCacheInterface.flushSecondaryEventCache(logger, cacheInst, primaryEventData)
                  .then(finalCache => {
                    this.emit('FLUSH', 'EventFlush', 'OK', finalCache)
                  })
                  .catch(error => {
                    throw error
                  })
              }
            })
            .catch(error => {
              throw error
            })
        }
      })
      .catch(error => {
        this.emit('ERROR', 'SingleEventObjectCacheError', 'ERROR', util.format('Failed to process the data event for the cache %s. Details: %s', primaryEventData, error.message), record)
      })
  }

  /*
  * Description:
  *
  * Args:
  *
  * Returns:
  *
  * Throws:
  *
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  let multiSecondaryCache = (logger, cacheInst, primaryEventData, objectEventData, record) => {
    return Promise.resolve()
      .then(() => objectCacheInterface.hasSecondaryEntry(logger, cacheInst.cache, primaryEventData, objectEventData))
      .then(hasSecondaryEntry => {
        if (hasSecondaryEntry) {
          return objectCacheInterface.updateEntryToObjectCache(logger, cacheInst, primaryEventData, objectEventData, record)
            .then(oldRecord => {
              this.emit('INSERT', 'ObjectCacheUpdate', 'OK', oldRecord)
            })
            .catch(error => {
              throw error
            })
        } else {
          return objectCacheInterface.addEntryToTimeCache(logger, cacheInst, primaryEventData, objectEventData, record)
            .then(() => {
              this.emit('INSERT', 'ObjectCacheCreate', 'OK', null)
            })
            .catch(error => {
              throw error
            })
        }
      })
      .then(() => objectCacheInterface.doesCacheNeedFlush(logger, cacheInst))
      .then(doesCacheNeedFlush => {
        if (doesCacheNeedFlush) {
          return objectCacheInterface.flushCache(logger, cacheInst)
            .then(cacheObj => {
              this.emit('FLUSH', 'CacheFlush', 'OK', cacheObj)
            })
            .catch(error => {
              // Could result in endless loop with new messages possibliy triggering new error events never empting the cache
              throw error
            })
        } else {
          return objectCacheInterface.doesCacheSecondaryNeedFlush(logger, cacheInst, primaryEventData, objectEventData)
            .then(doesCacheSecondaryNeedFlush => {
              if (doesCacheSecondaryNeedFlush) {
                return objectCacheInterface.flushSecondaryEventCache(logger, cacheInst, primaryEventData)
                  .then(finalCache => {
                    this.emit('FLUSH', 'EventFlush', 'OK', finalCache)
                  })
                  .catch(error => {
                    throw error
                  })
              }
            })
            .catch(error => {
              throw error
            })
        }
      })
      .catch(error => {
        this.emit('ERROR', 'MultiEventObjectCacheError', 'ERROR', util.format('Failed to process the data event for the cache %s. Details: %s', primaryEventData, error.message), record)
      })
  }

  /*
  * Description:
  *   This function resolves with an object that has the cache and its respective functions that the microservice
  *     can interact with.
  * Args:
  *   configJSON (Object): This argument is a validated JSON Object that has relevant configuration
  * Returns:
  *   cache (Promise): This Promise resolves to an cache Object that has the cache and applicable functions to
  *     modify the cache.
  * Throws:
  *
  * Notes:
  *   Example of output:
  *     {
  *       "addEntryToCache": "[Promise]",
  *       "updateEntryToCache": "[Promise]",
  *       "flushCache": "[Promise]"
  *     }
  * TODO:
  *   [#1]:
  */

  this.initCache = (logger, rawConfigJSON) => {
    return new Promise(
      resolve => {
        logger.log('debug', 'Starting to initialize a Cache client ...')
        resolve()
      })
      .then(() => cacheUtilities.initAggregator(rawConfigJSON))
      .then(configJSON => {
        let cacheType = configJSON['setup']
        if (cacheType === 'internal') {
          logger.log('info', '... The type of cache is internal ...')
          return (Promise.resolve()
            .then(() => internalCache.init(logger, cache, configJSON))
            .catch(error => {
              throw error
            }))
        } else if (cacheType === 'external') {
          logger.log('info', '... The type of cache is external ...')
          return (Promise.resolve()
            .then(() => externalCache.init(logger, cache, configJSON))
            .catch(error => {
              throw error
            }))
        } else {
          throw new Error(util.format('The cache type is invalid expecting \'internal\' or \'external\' but received: %s', cacheType))
        }
      })
      .then(() => {
        storageStrategy = cache.config['storage']['strategy']
        storagePolicyArchiveBy = cache.config['storage']['policy']['archiveBy']
        logger.log('debug', '... Successfully created a Cache client.')
        return undefined
      })
      .catch(error => {
        throw new InitializationError(util.format('... Failed to initialize the Aggregator\'s cache. Details: %s', error.message))
      })
  }

  /*
  * Description:
  *
  * Args:
  *
  * Returns:
  *
  * Throws:
  *
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  this.processRecord = (logger, record, primaryEventData, objectEventData) => {
    if (storageStrategy === 'singleEvent') {
      if (storagePolicyArchiveBy === 'Array') {
        return Promise.resolve()
          .then(() => singleTimeCache(logger, cache, primaryEventData, record))
          .catch(error => {
            throw error
          })
      } else {
        return Promise.resolve()
          .then(() => singleSecondaryCache(logger, cache, primaryEventData, objectEventData, record))
          .catch(error => {
            throw error
          })
      }
    } else if (storageStrategy === 'multiEvent') {
      if (storagePolicyArchiveBy === 'Array') {
        return Promise.resolve()
          .then(() => multiTimeCache(logger, cache, primaryEventData, record))
          .catch(error => {
            throw error
          })
      } else {
        return Promise.resolve()
          .then(() => multiSecondaryCache(logger, cache, primaryEventData, objectEventData, record))
          .catch(error => {
            throw error
          })
      }
    } else {
      throw new InitializationError('Failed to process record please intialize the client first.')
    }
  }

  /*
  * Description:
  *
  * Args:
  *
  * Returns:
  *
  * Throws:
  *
  * Notes:
  *   N/A
  * TODO:
  *   [#1]:
  */

  this.flushCache = (logger, typeOfFlush, primaryEventData) => {
    if (typeOfFlush === 'event') {
      if (storagePolicyArchiveBy === 'Array') {
        return Promise.resolve()
          .then(() => arrayCacheInterface.flushTimeCache(logger, cache, primaryEventData))
          .catch(error => {
            throw new AggregatorError(util.format('Failed to flush event cache for %s. Details: %s', primaryEventData, error.message))
          })
      } else {
        return Promise.resolve()
          .then(() => objectCacheInterface.flushSecondaryEventCache(logger, cache, primaryEventData))
          .catch(error => {
            throw new AggregatorError(util.format('Failed to flush event cache for %s. Details: %s', primaryEventData, error.message))
          })
      }
    } else if (typeOfFlush === 'cache') {
      if (storagePolicyArchiveBy === 'Array') {
        return Promise.resolve()
          .then(() => arrayCacheInterface.flushCache(logger, cache))
          .catch(error => {
            throw new AggregatorError(util.format('Failed to flush the array based cache. Details: %s', error.message))
          })
      } else {
        return Promise.resolve()
          .then(() => objectCacheInterface.flushCache(logger, cache))
          .catch(error => {
            throw new AggregatorError(util.format('Failed to flush the object Cache Interface. Details: %s', error.message))
          })
      }
    } else {
      throw new Error(util.format('Failed to manually flush cache. Unknown type of flush. Received %s', typeOfFlush))
    }
  }
}
util.inherits(cacheInterface, EventEmitter)

module.exports = cacheInterface
