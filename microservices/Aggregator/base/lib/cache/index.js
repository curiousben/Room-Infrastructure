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
*       "response": "JSON Object with payload that relates to status"
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

let processRecord = (logger, data, primaryRecordEvntData, secondaryRecordEvntData) => {
  if (storageStrategy === 'singleEvent') {
    if (storagePolicyArchiveBy === 'time') {
      return Promise.resolve()
        .then(() => timeCacheInterface.singleTimeCache(logger, this, primaryRecordEvntData))
        .catch(error => {
          throw error
        })
    } else {
      return Promise.resolve()
        .then(() => secondaryCacheInterface.hasPrimaryEntry())
    }
  } else if (storageStrategy === 'multiEvent') {
    if (storagePolicyArchiveBy === 'time') {
      return Promise.resolve()
        .then(() => timeCacheInterface.hasPrimaryEntry(logger, this.cache, primaryRecordEvntData))
    } else {
      return Promise.resolve()
        .then(() => secondaryCacheInterface.hasPrimaryEntry())
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

let multiTimeCache = (logger, cacheInst, primaryRecordEvntData, record) => {
  return Promise.resolve()
    .then(() => timeCacheInterface.hasPrimaryEntry(logger, cacheInst.cache, primaryRecordEvntData))
    .then(hasPrimaryEntry => {
      if (hasPrimaryEntry) {
        return timeCacheInterface.updateEntryToTimeCache(logger, cacheInst, primaryRecordEvntData, record)
          .catch(error => {
            throw error
          })
      } else {
        return timeCacheInterface.addEntryToTimeCache(logger, cacheInst, primaryRecordEvntData, record)
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
            let cacheInterfaceResponse {}
            cacheInterfaceResponse['status'] = 1
            cacheInterfaceResponse['response'] = cacheObj
            return cacheObj
          })
          .catch(error => {
            // Could result in endless loop with new messages possibliy triggering new error events never empting the cache
            throw error
          })
      } else {
        return timeCacheInterface.doesCacheTimeNeedFlush(logger, cacheInst, primaryRecordEvntData)
          .then(doesCacheTimeNeedFlush = {
            if (doesCacheTimeNeedFlush) {
              return timeCacheInterface.flushTimeCache(logger, cacheInst, primaryRecordEvntData)
                .then(finalCache => {
                  return {'status': 0, 'response': finalCache}
                })
                .catch(error => {
                  throw error
                })
            } else {
              // Message has been successfully placed into the cache
              return {'status': 0, 'response': 'OK'}
            }
          })
          .catch(error => {
            throw error
          })
      }
    })
    .catch(error => {
      throw new Error(util.format('Failed to process data %s for the cache %s. Details: %s', JSON.stringify(record), primaryRecordEvntData, error.message))
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

let multiSecondaryCache = (logger, cacheInst, mainEvent, secondaryEvent, record) => {
  return Promise.resolve()
    .then(() => secondaryCacheInterface.hasSecondaryEntry(logger, cacheInst.cache, mainEvent))
    .then(hasSecondaryEntry => {
      if (hasSecondaryEntry) {
        return secondaryCacheInterface.updateEntryToObjectCache(logger, cacheInst, mainEvent, secondaryEvent, record)
          .catch(error => {
            throw error
          })
      } else {
        return secondaryCacheInterface.addEntryToTimeCache(logger, cacheInst, mainEvent, secondaryEvent, record)
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
            let cacheInterfaceResponse {}
            cacheInterfaceResponse['status'] = 1
            cacheInterfaceResponse['response'] = cacheObj
            return cacheObj
          })
          .catch(error => {
            // Could result in endless loop with new messages possibliy triggering new error events never empting the cache
            throw error
          })
      } else {
        return secondaryCacheInterface.doesCacheSecondaryNeedFlush(logger, cacheInst, mainEvent, secondaryEvent)
          .then(doesCacheSecondaryNeedFlush = {
            if (doesCacheSecondaryNeedFlush) {
              return secondaryCacheInterface.flushSecondaryEventCache(logger, cacheInst, mainEvent)
                .then(finalCache => {
                  return {'status': 0, 'response': finalCache}
                })
                .catch(error => {
                  throw error
                })
            } else {
              // Message has been successfully placed into the cache
              return {'status': 0, 'response': 'OK'}
            }
          })
          .catch(error => {
            throw error
          })
      }
    })
    .catch(error => {
      throw new Error(util.format('Failed to process data %s for the cache %s. Details: %s', JSON.stringify(record), mainEvent, error.message))
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
/*
let processRecordMultiCache = (that, primaryRecordEvntData, secondaryRecordEvntData, data, cache) => {
  return Promise.resolve()
    .then(() => readModule.hasPrimaryEntry(primaryRecordEvntData, cache))
    .then(hasPrimaryEntry => {
      if (hasPrimaryEntry) { // This primary event has been encountered before
        if (this.properties['storage.policy.archiveBy'] === 'time') {
          return updateEntryToTimeCache(primaryRecordEvntData, data, cache)
        } else if (this.properties['storage.policy.archiveBy'] === 'secondaryEvent') {
          return readModule.hasSecondaryEntry(primaryRecordEvntData, secondaryRecordEvntData, cache)
            .then(hasSecondaryEntry => {
              if (hasSecondaryEntry) { // This secondary event has been encountered before
                return updateEntryToSecondCache(primaryRecordEvntData, secondaryRecordEvntData, data, cache)
              } else { // This secondary event is new
                return addEntryToSecondCache(primaryRecordEvntData, secondaryRecordEvntData, data, cache)
              }
            })
            .catch(error => {
              throw error
            })
        } else {
          return 'UNIMPLEMENTED'
        }
      } else { // This primary event is a new event
        if (this.properties['storage.policy.archiveBy'] === 'time') {
          return addEntryToTimeCache(primaryRecordEvntData, data, cache)
        } else if (this.properties['storage.policy.archiveBy'] === 'secondaryEvent') {
          return addEntryToPrimaryCache(primaryRecordEvntData, cache)
            .then(() => addEntryToSecondCache(primaryRecordEvntData, secondaryRecordEvntData, data, cache))
        } else {
          return 'UNIMPLEMENTED'
        }
      }
    })
    .then(() => doesCacheNeedFlush(primaryRecordEvntData, secondaryRecordEvntData))
    .then(cacheNeedsFlush => {
      if (cacheNeedsFlush) {
        return flushCache(cache, primaryRecordEvntData, secondaryRecordEvntData)
          .catch(error => {
            throw error
          })
      } else {
        return 'OK'
      }
    })
    .catch(error => {
      throw error
    })
}
*/
module.exports = {
  initCache: initCache
  addEntryToCache: cacheInterface.addEntryToCache,
  flushCache: cacheInterface.flushCache
}
