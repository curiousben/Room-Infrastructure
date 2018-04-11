/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

'use strict'

/*
* Module design:
*   This module will initialize the
*/

const util = require('util')
const createModule = require('./methods/createEntry.js')
const readModule = require('./methods/readEntry.js')
const updateModule = require('./methods/updateEntry.js')
const deleteModule = require('./methods/deleteEntry.js')
const bufferManagement = require('./utilities/bufferManagement.js')
const secondaryCacheManagement = require('./utilities/secondaryCacheManagement.js')

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

let addEntryToObjectCache = (logger, cacheInst, primaryEventData, secondaryEventData, record) => {
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to add the data for the %s to the %s cache ...', secondaryEventData, primaryEventData)
      return undefined
    })
    .then(() => readModule.readPrimaryEntry(primaryEventData, cacheInst.cache))
    .then(value => {
      if (value === undefined) {
        return createModule.createCacheEntry(cacheInst.cache, primaryEventData, {})
      } else {
        return undefined
      }
    })
    .then(() => bufferManagement.createBufferFromString(record))
    .then(buffer => createModule.createCacheEntry(cacheInst.cache[primaryEventData], secondaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromBuffer(buffer))
    .then(bufferSize => secondaryCacheManagement.increaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, primaryEventData))
    .then(() => secondaryCacheManagement.increaseEventSize(cacheInst.properties.numberOfEvents, primaryEventData))
    .then(() => {
      logger.log('debug', '... Successfully added the %s data to the %s cache', secondaryEventData, primaryEventData)
      return undefined
    })
    .catch(error => {
      throw new Error(util.format('... Failed to add %s data ot the %s cache. Details:%s', secondaryEventData, primaryEventData, error.message))
    }))
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
*
* TODO:
*   [#1]:
*
* Design:
*   1.  Retrieve Record at secondary key
*   2.  Decrease event count by 1
*   3.  Decrease cache size by retrieved record size
*   4.  Create buffer from retrieved Record
*   5.  Insert record at secondary cache location
*   6.  Increase event count by 1
*   7.  Increase cache size by new record size
*   8.  Return retrieve record
*
*/

let updateEntryToObjectCache = (logger, cacheInst, primaryEventData, secondaryEventData, record) => {
  let oldRecord = null
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to update the %s data for the %s cache ...', secondaryEventData, primaryEventData)
      return undefined
    })
    .then(() => readModule.readSecondaryEntry(primaryEventData, secondaryEventData, cacheInst.cache))
    .then(oldCacheEntry => {
      oldRecord = oldCacheEntry
      return oldCacheEntry
    })
    .then(oldCacheEntry => bufferManagement.getSizeOfBufferFromBuffer(oldCacheEntry))
    .then(bufferSize => secondaryCacheManagement.decreaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, primaryEventData, secondaryEventData))
    .then(() => secondaryCacheManagement.decreaseEventSize(cacheInst.properties.numberOfEvents, primaryEventData, secondaryEventData))
    .then(() => bufferManagement.createBufferFromString(record))
    .then(buffer => updateModule.addValueToObj(cacheInst.cache[primaryEventData], secondaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromBuffer(buffer))
    .then(bufferSize => secondaryCacheManagement.increaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, primaryEventData, secondaryEventData))
    .then(() => secondaryCacheManagement.increaseEventSize(cacheInst.properties.numberOfEvents, primaryEventData, secondaryEventData))
    .then(() => {
      logger.log('debug', '... Successfully updated the %s data to the %s cache', secondaryEventData, primaryEventData)
      return oldRecord
    })
    .catch(error => {
      throw new Error(util.format('... Failed to update the %s data to the %s cache. Details:%s', secondaryEventData, primaryEventData, error.message))
    }))
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

let doesCacheSecondaryNeedFlush = (logger, cacheInst, mainEvent, secondaryEvent) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to determine if data for %s for the %s cache needs to be flushed ...', secondaryEvent, mainEvent)
      return undefined
    })
    .then(() => secondaryCacheManagement.getEventSize(cacheInst.properties.numberOfEvents, mainEvent, secondaryEvent))
    .then(eventSize => {
      if (eventSize >= cacheInst.config['storage']['policy']['eventLimit']) {
        logger.log('debug', '... The data for %s for the %s cache needs to be flushed.')
        return true
      } else {
        logger.log('debug', '... The data for %s for the %s cache does not need to be flushed.')
        return false
      }
    })
    .catch(error => {
      throw new Error(util.format('... Failed to determine if data for %s for the %s cache needs to be flushed. Details:%s', secondaryEvent, mainEvent, error.message))
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

let doesCacheNeedFlush = (logger, cacheInst) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to determine if the cache needs to be flushed ...')
      return undefined
    })
    .then(() => secondaryCacheManagement.getCacheSize(cacheInst.properties.sizeOfCache))
    .then(cacheSize => {
      if (cacheSize >= cacheInst.config['storage']['byteSizeWatermark']) {
        logger.log('debug', '... The cache needs to be flushed ...')
        return true
      } else {
        logger.log('debug', '... The cache does not need to be flushed ...')
        return false
      }
    })
    .catch(error => {
      throw new Error(util.format('... Failed to determine if the cache needs to be flushed. Details:%s', error.message))
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

let flushSecondaryEventCache = (logger, cacheInst, mainEvent) => {
  let eventCacheObj = {}
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to flush the %s cache ...', mainEvent)
      return undefined
    })
    .then(() => secondaryCacheManagement.resetEventSize(cacheInst.properties.numberOfEvents, mainEvent))
    .then(() => secondaryCacheManagement.resetBufferSize(cacheInst.properties.sizeOfCache, mainEvent))
    .then(() => deleteModule.removeEntryObj(mainEvent, cacheInst.cache))
    .then(rawCacheObj => {
      let promiseArray = []
      for (const [key, value] of Object.entries(rawCacheObj)) {
        promiseArray.push(new Promise(
          resolve => {
            resolve(bufferManagement.getJSONFromBuffer(value))
          })
          .then(JSON => {
            eventCacheObj[key] = JSON
            return undefined
          })
          .catch(error => {
            throw error
          })
        )
      }
      return promiseArray
    })
    .then(promiseArray => Promise.all(promiseArray))
    .then(() => {
      let finalCache = {}
      finalCache[mainEvent] = eventCacheObj
      logger.log('debug', '... Successfully flushed the %s cache', mainEvent)
      return finalCache
    })
    .catch(error => {
      throw new Error(util.format('... Failed to flush the %s cache. Details:%s', mainEvent, error.message))
    }))
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

let flushCache = (logger, cacheInst) => {
  let cacheObj = {}
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to flush the whole cache ...')
      return undefined
    })
    .then(() => {
      let promiseArray = []
      for (const key of Object.keys(cacheInst.cache)) {
        promiseArray.push(new Promise(
          resolve => {
            resolve(flushSecondaryEventCache(logger, cacheInst, key))
          })
          .then(JSON => {
            cacheObj = Object.assign(cacheObj, JSON)
            return undefined
          })
          .catch(error => {
            throw error
          })
        )
      }
      return promiseArray
    })
    .then(promiseArray => Promise.all(promiseArray))
    .then(() => {
      logger.log('debug', '... Finished flushing the whole cache')
      return cacheObj
    })
    .catch(error => {
      throw new Error(util.format('... Failed to flush the whole cache. Details:%s', error.message))
    })
}

/*
* Description:
*   This method searches for an entry in the cache that is the secondary event. This only makes sense
*     if used for secondary strorage policy.
* Args:
*   key (String): This String is the key that represents the primary event.
*   subkey (String): This String is the key that represents the secondary event.
*   cache (Object): This Object is the internal cache that is being searched
* Returns:
*   result (Promise): This promise resolves to the boolean value of whether the value exists in the cache
* Throws:
*   N/A
* Notes:
*   To work around a for loop that searchs the whole Object we suppose the value exists and change the boolean
*     statement if it is false.
* TODO:
*   [#1]:
*/

let hasSecondaryEntry = (logger, key, subKey, cache) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to check to see if there is data for %s for the cache %s', subKey, key)
      return undefined
    })
    .then(() => readModule.readPrimaryEntry(key, cache))
    .then(value => {
      if (value !== undefined) {
        return readModule.readSecondaryEntry(key, subKey, cache)
          .then(subValue => {
            if (subValue === undefined) {
              logger.log('debug', '... There is no data for %s for the %s cache', subKey, key)
              return false
            } else {
              logger.log('debug', '... There is data for %s for the %s cache', subKey, key)
              return true
            }
          })
          .catch(error => {
            throw error
          })
      } else {
        logger.log('debug', '... There was no cache object for %s', key)
        return false
      }
    })
    .catch(error => {
      throw new Error(util.format('... Failed to check to see if there was data for %s for the cache %s. Details:%s', subKey, key, error.message))
    })
}

module.exports = {
  addEntryToObjectCache: addEntryToObjectCache,
  updateEntryToObjectCache: updateEntryToObjectCache,
  doesCacheSecondaryNeedFlush: doesCacheSecondaryNeedFlush,
  flushSecondaryEventCache: flushSecondaryEventCache,
  hasSecondaryEntry: hasSecondaryEntry,
  doesCacheNeedFlush: doesCacheNeedFlush,
  flushCache: flushCache
}
