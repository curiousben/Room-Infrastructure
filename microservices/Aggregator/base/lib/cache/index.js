/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

/*
* Module design:
*   This module will be responsible for initializing the correct cache and subsequent methods for interacting
*   with the cache that this microservice is responsible for. The object that will be returned will be the
*   cache (for the internal or external) and methods for interacting with.
*/

const internalCache = require('./internalStructure/index.js')
const externalCache = require('./externalStructure/index.js')
const timeCacheInterface = require('./cacheInterface/timeCache.js')
const secondaryCacheInterface = require('./cacheInterface/secondaryCache.js')

this.cache = null
this.config = {}
this.properties = {}

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
          .then(() => internalCache.init(this, logger, configJSON))
          .catch(error => {
            throw error
          }))
      } else if (cacheType === 'external') {
        logger.log('info', '... The type of cache is external ...')
        return (Promise.resolve()
          .then(() => externalCache.init(this, logger, configJSON))
          .catch(error => {
            throw error
          }))
      } else {
        throw new Error('The cache type is invalid expecting \'internal\' or \'external\' but received: ' + cacheType)
      }
    })
    .then(() => cacheInterface.init(this, logger))
    .then(() => {
      logger.log('debug', '... Successfully created a Cache client.')
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

let processRecordSingleCache = (primaryRecordEvntData, secondaryRecordEvntData, data) => {
  return Promise.resolve()
    .then(() => cacheInterface.hasPrimaryEntry(primaryRecordEvntData, this.cache))
    .then(hasPrimaryEntry => {
      if (hasPrimaryEntry) { // This event has been encountered before
        if (this.properties['storage.policy.archiveBy'] === 'time') {
          return updateEntryToTimeCache(primaryRecordEvntData, data, cache)
        } else if (this.properties['storage.policy.archiveBy'] === 'secondaryEvent') {
          return readModule.hasSecondaryEntry(primaryRecordEvntData, secondaryRecordEvntData, cache)
            .then(hasSecondaryEntry => {
              if (hasSecondaryEntry) {
                return updateEntryToSecondCache(primaryRecordEvntData, secondaryRecordEvntData, data, cache)
              } else {
                return addEntryToSecondCache(primaryRecordEvntData, secondaryRecordEvntData, data, cache)
              }
            })
            .catch(error => {
              throw error
            })
        } else {
          return 'UNIMPLEMENTED'
        }
      } else { // This is a new event
        if (this.sizeOfCache === 0) { // The cache has not collected any data and is being initialized
          if (this.properties['storage.policy.archiveBy'] === 'time') {
            return addEntryToTimeCache(primaryRecordEvntData, data, cache)
          } else if (this.properties['storage.policy.archiveBy'] === 'secondaryEvent') {
            return addEntryToPrimaryCache(primaryRecordEvntData, cache)
              .then(() => addEntryToSecondCache(primaryRecordEvntData, secondaryRecordEvntData, data, cache))
          }
        } else { // The cache has previously collected data
          return true
        }
      }
    })
    .then(processingResult => {
      if (processingResult !== true) {
        return doesCacheNeedFlush(primaryRecordEvntData, secondaryRecordEvntData)
      } else {
        return processingResult
      }
    })
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

module.exports = {
  initCache: initCache,
  addEntryToCache: cacheInterface.addEntryToCache,
  flushCache: cacheInterface.flushCache
}
