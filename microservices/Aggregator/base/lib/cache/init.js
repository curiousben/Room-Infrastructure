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
*     {
*       "status": 1 or 0,
*       "responseType": "Type of action that was taken on the cache",
*       "response": "JSON Object with payload that relates to status",
*       "error": "If an error was raised then the error will be located in this section of the JSON object"
*     }
*/

const internalCache = require('./internalStructure/init.js')
const externalCache = require('./externalStructure/init.js')
const timeCacheInterface = require('./cacheInterface/timeCache.js')
const secondaryCacheInterface = require('./cacheInterface/secondaryCache.js')
const util = require('util')

let storageStrategy = null
let storagePolicyArchiveBy = null

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

let initCache = (logger, configJSON) => {
  return new Promise(
    resolve => {
      logger.log('debug', 'Starting to initialize a Cache client ...')
      resolve()
    })
    .then(() => {
      let cacheType = configJSON['setup']
      if (cacheType === 'internal') {
        logger.log('info', '... The type of cache is internal ...')
        return (Promise.resolve()
          .then(() => internalCache.init(logger, this, configJSON))
          .catch(error => {
            throw error
          }))
      } else if (cacheType === 'external') {
        logger.log('info', '... The type of cache is external ...')
        return (Promise.resolve()
          .then(() => externalCache.init(logger, this, configJSON))
          .catch(error => {
            throw error
          }))
      } else {
        throw new Error(util.format('The cache type is invalid expecting \'internal\' or \'external\' but received: %s', cacheType))
      }
    })
    .then(() => {
      storageStrategy = this.config['storage']['strategy']
      storagePolicyArchiveBy = this.config['storage']['policy']['archiveBy']
      logger.log('debug', '... Successfully created a Cache client.')
      return undefined
    })
    .catch(error => {
      throw error
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

let processRecord = (logger, record, primaryEventData, secondaryEventData) => {
  if (storageStrategy === 'singleEvent') {
    if (storagePolicyArchiveBy === 'time') {
      return Promise.resolve()
        .then(() => singleTimeCache(logger, this, primaryEventData, record))
        .catch(error => {
          throw error
        })
    } else {
      return Promise.resolve()
        .then(() => singleSecondaryCache(logger, this, primaryEventData, secondaryEventData, record))
        .catch(error => {
          throw error
        })
    }
  } else if (storageStrategy === 'multiEvent') {
    if (storagePolicyArchiveBy === 'time') {
      return Promise.resolve()
        .then(() => multiTimeCache(logger, this, primaryEventData, record))
        .catch(error => {
          throw error
        })
    } else {
      return Promise.resolve()
        .then(() => multiSecondaryCache(logger, this, primaryEventData, secondaryEventData, record))
        .catch(error => {
          throw error
        })
    }
  } else {
    throw new Error(util.format('Failed to process record please intialize the client first.'))
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

let singleTimeCache = (logger, cacheInst, primaryEventData, record) => {
  return Promise.resolve()
    .then(() => timeCacheInterface.hasPrimaryEntry(logger, cacheInst.cache, primaryEventData))
    .then(hasPrimaryEntry => {
      if (hasPrimaryEntry) {
        return timeCacheInterface.isCacheEmpty(logger, cacheInst.properties.sizeOfCache)
          .then(isCacheEmpty => {
            if (isCacheEmpty) {
              return timeCacheInterface.updateEntryToTimeCache(logger, cacheInst, primaryEventData, record)
                .catch(error => {
                  throw error
                })
            } else {
              return timeCacheInterface.addEntryToTimeCache(logger, cacheInst, primaryEventData, record)
                .catch(error => {
                  throw error
                })
            }
          })
          .then(() => timeCacheInterface.doesCacheNeedFlush(logger, cacheInst))
          .then(doesCacheNeedFlush => {
            if (doesCacheNeedFlush) {
              return timeCacheInterface.flushCache(logger, cacheInst)
                .then(cacheObj => {
                  return {'status': 1, 'responseType': 'cacheFlush', 'payload': cacheObj, 'error': ''}
                })
                .catch(error => {
                  // Could result in endless loop with new messages possibliy triggering new error events never empting the cache
                  throw error
                })
            } else {
              return timeCacheInterface.doesCacheTimeNeedFlush(logger, cacheInst, primaryEventData)
                .then(doesCacheTimeNeedFlush => {
                  if (doesCacheTimeNeedFlush) {
                    return timeCacheInterface.flushTimeCache(logger, cacheInst, primaryEventData)
                      .then(finalCache => {
                        return {'status': 0, 'responseType': 'eventFlush', 'payload': finalCache, 'error': ''}
                      })
                      .catch(error => {
                        throw error
                      })
                  } else {
                    // Message has been successfully placed into the cache
                    return {'status': 0, 'responseType': 'insert', 'payload': '', 'error': ''}
                  }
                })
                .catch(error => {
                  throw error
                })
            }
          })
          .catch(error => {
            throw error
          })
      } else {
        return timeCacheInterface.flushTimeCache(logger, cacheInst, primaryEventData)
          .then(finalCache => {
            return {'status': 0, 'responseType': 'eventFlush', 'payload': finalCache, 'error': ''}
          })
          .catch(error => {
            throw error
          })
      }
    })
    .catch(error => {
      return {'status': 1, 'responseType': 'error', 'payload': record, 'error': util.format('Failed to process the data event for the cache %s. Details: %s', primaryEventData, error.message)}
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
    .then(() => timeCacheInterface.hasPrimaryEntry(logger, cacheInst.cache, primaryEventData))
    .then(hasPrimaryEntry => {
      if (hasPrimaryEntry) {
        return timeCacheInterface.updateEntryToTimeCache(logger, cacheInst, primaryEventData, record)
          .catch(error => {
            throw error
          })
      } else {
        return timeCacheInterface.addEntryToTimeCache(logger, cacheInst, primaryEventData, record)
          .catch(error => {
            throw error
          })
      }
    })
    .then(() => timeCacheInterface.doesCacheNeedFlush(logger, cacheInst))
    .then(doesCacheNeedFlush => {
      if (doesCacheNeedFlush) {
        return timeCacheInterface.flushCache(logger, cacheInst)
          .then(cacheObj => {
            return {'status': 1, 'responseType': 'cacheFlush', 'payload': cacheObj, 'error': ''}
          })
          .catch(error => {
            // Could result in endless loop with new messages possibliy triggering new error events never empting the cache
            throw error
          })
      } else {
        return timeCacheInterface.doesCacheTimeNeedFlush(logger, cacheInst, primaryEventData)
          .then(doesCacheTimeNeedFlush => {
            if (doesCacheTimeNeedFlush) {
              return timeCacheInterface.flushTimeCache(logger, cacheInst, primaryEventData)
                .then(finalCache => {
                  return {'status': 0, 'responseType': 'eventFlush', 'payload': finalCache, 'error': ''}
                })
                .catch(error => {
                  throw error
                })
            } else {
              // Message has been successfully placed into the cache
              return {'status': 0, 'responseType': 'insert', 'payload': '', 'error': ''}
            }
          })
          .catch(error => {
            throw error
          })
      }
    })
    .catch(error => {
      return {'status': 1, 'responseType': 'error', 'payload': record, 'error': util.format('Failed to process the data event for the cache %s. Details: %s', primaryEventData, error.message)}
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

let singleSecondaryCache = (logger, cacheInst, primaryEventData, secondaryEventData, record) => {
  return Promise.resolve()
    .then(() => secondaryCacheInterface.hasPrimaryEntry(logger, cacheInst.cache, primaryEventData))
    .then(hasPrimaryEntry => {
      if (hasPrimaryEntry) {
        return secondaryCacheInterface.isCacheEmpty(logger, cacheInst.properties.sizeOfCache)
          .then(isCacheEmpty => {
            if (isCacheEmpty) {
              return secondaryCacheInterface.updateEntryToObjectCache(logger, cacheInst, primaryEventData, secondaryEventData, record)
                .catch(error => {
                  throw error
                })
            } else {
              return secondaryCacheInterface.addEntryToObjectCache(logger, cacheInst, primaryEventData, secondaryEventData, record)
                .catch(error => {
                  throw error
                })
            }
          })
          .then(() => secondaryCacheInterface.doesCacheNeedFlush(logger, cacheInst))
          .then(doesCacheNeedFlush => {
            if (doesCacheNeedFlush) {
              return secondaryCacheInterface.flushCache(logger, cacheInst)
                .then(cacheObj => {
                  return {'status': 1, 'responseType': 'cacheFlush', 'payload': cacheObj, 'error': ''}
                })
                .catch(error => {
                  // Could result in endless loop with new messages possibliy triggering new error events never empting the cache
                  throw error
                })
            } else {
              return secondaryCacheInterface.doesCacheSecondaryNeedFlush(logger, cacheInst, primaryEventData, secondaryEventData)
                .then(doesCacheSecondaryNeedFlush => {
                  if (doesCacheSecondaryNeedFlush) {
                    return secondaryCacheInterface.flushSecondaryEventCache(logger, cacheInst, primaryEventData)
                      .then(finalCache => {
                        return {'status': 0, 'responseType': 'eventFlush', 'payload': finalCache, 'error': ''}
                      })
                      .catch(error => {
                        throw error
                      })
                  } else {
                    // Message has been successfully placed into the cache
                    return {'status': 0, 'responseType': 'insert', 'payload': '', 'error': ''}
                  }
                })
                .catch(error => {
                  throw error
                })
            }
          })
          .catch(error => {
            throw error
          })
      } else {
        return secondaryCacheInterface.flushSecondaryEventCache(logger, cacheInst, primaryEventData)
          .then(finalCache => {
            return {'status': 0, 'responseType': 'eventFlush', 'payload': finalCache, 'error': ''}
          })
          .catch(error => {
            throw error
          })
      }
    })
    .catch(error => {
      return {'status': 1, 'responseType': 'error', 'payload': record, 'error': util.format('Failed to process the data event for the cache %s. Details: %s', primaryEventData, error.message)}
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

let multiSecondaryCache = (logger, cacheInst, primaryEventData, secondaryEventData, record) => {
  return Promise.resolve()
    .then(() => secondaryCacheInterface.hasSecondaryEntry(logger, cacheInst.cache, primaryEventData))
    .then(hasSecondaryEntry => {
      if (hasSecondaryEntry) {
        return secondaryCacheInterface.updateEntryToObjectCache(logger, cacheInst, primaryEventData, secondaryEventData, record)
          .catch(error => {
            throw error
          })
      } else {
        return secondaryCacheInterface.addEntryToTimeCache(logger, cacheInst, primaryEventData, secondaryEventData, record)
          .catch(error => {
            throw error
          })
      }
    })
    .then(() => secondaryCacheInterface.doesCacheNeedFlush(logger, cacheInst))
    .then(doesCacheNeedFlush => {
      if (doesCacheNeedFlush) {
        return secondaryCacheInterface.flushCache(logger, cacheInst)
          .then(cacheObj => {
            return {'status': 1, 'responseType': 'cacheFlush', 'payload': cacheObj, 'error': ''}
          })
          .catch(error => {
            // Could result in endless loop with new messages possibliy triggering new error events never empting the cache
            throw error
          })
      } else {
        return secondaryCacheInterface.doesCacheSecondaryNeedFlush(logger, cacheInst, primaryEventData, secondaryEventData)
          .then(doesCacheSecondaryNeedFlush => {
            if (doesCacheSecondaryNeedFlush) {
              return secondaryCacheInterface.flushSecondaryEventCache(logger, cacheInst, primaryEventData)
                .then(finalCache => {
                  return {'status': 0, 'responseType': 'eventFlush', 'payload': finalCache, 'error': ''}
                })
                .catch(error => {
                  throw error
                })
            } else {
              // Message has been successfully placed into the cache
              return {'status': 0, 'responseType': 'insert', 'payload': '', 'error': ''}
            }
          })
          .catch(error => {
            throw error
          })
      }
    })
    .catch(error => {
      return {'status': 1, 'responseType': 'error', 'payload': record, 'error': util.format('Failed to process the data event for the cache %s. Details: %s', primaryEventData, error.message)}
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

let flushCache = (logger, typeOfFlush, primaryEventData) => {
  if (typeOfFlush === 'event') {
    if (storagePolicyArchiveBy === 'time') {
      return Promise.resolve()
        .then(() => timeCacheInterface.flushSecondaryEventCache(logger, this, primaryEventData))
        .catch(error => {
          throw error
        })
    } else {
      return Promise.resolve()
        .then(() => secondaryCacheInterface.flushSecondaryEventCache(logger, this, primaryEventData))
        .catch(error => {
          throw error
        })
    }
  } else if (typeOfFlush === 'cache') {
    if (storagePolicyArchiveBy === 'time') {
      return Promise.resolve()
        .then(() => timeCacheInterface.flushCache(logger, this))
        .catch(error => {
          throw error
        })
    } else {
      return Promise.resolve()
        .then(() => secondaryCacheInterface.flushCache(logger, this))
        .catch(error => {
          throw error
        })
    }
  } else {
    throw new Error(util.format('Failed to manually flush cache. Unknown type of flush. Received %s', typeOfFlush))
  }
}

module.exports = {
  initCache: initCache,
  processRecord: processRecord,
  flushCache: flushCache
}
