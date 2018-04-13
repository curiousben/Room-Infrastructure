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
const cacheManagement = require('./utilities/cacheManagement.js')

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

let addEntryToTimeCache = (logger, cacheInst, primaryEventData, record) => {
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to add data to the %s event cache', primaryEventData)
      return undefined
    })
    .then(() => createModule.createCacheEntry(cacheInst.cache, primaryEventData, []))
    .then(() => bufferManagement.createBufferFromString(record))
    .then(buffer => updateModule.addValueToArray(cacheInst.cache, primaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromString(record))
    .then(bufferSize => cacheManagement.increaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, primaryEventData))
    .then(() => cacheManagement.increaseEventSize(cacheInst.properties.numberOfEvents, primaryEventData))
    .then(() => {
      logger.log('debug', '... Successfully added data to the %s event cache', primaryEventData)
      return undefined
    })
    .catch(error => {
      throw new Error(util.format('... Failed to add data to the %s event cache. Details:%s', primaryEventData, error.message))
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

let addEntryToCache = (logger, cacheInst, primaryEvent) => {
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to add the event cache, %s, to the system cache ...', primaryEvent)
      return undefined
    })
    .then(() => createModule.createCacheEntry(cacheInst.cache, primaryEvent, {}))
    .then(entry => {
      logger.log('debug', '... Successfully added the event cache, %s, to the system cache.', primaryEvent)
      return entry
    })
    .catch(error => {
      throw new Error(util.format('... Failed to add the event cache, %s, to the system cache. Details:%s', primaryEvent, error.message))
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

let updateEntryToTimeCache = (logger, cacheInst, primaryEvent, record) => {
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to update the %s cache with the new record ...', primaryEvent)
      return undefined
    })
    .then(() => bufferManagement.createBufferFromString(record))
    .then(buffer => updateModule.addValueToArray(cacheInst.cache, primaryEvent, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromBuffer(buffer))
    .then(bufferSize => cacheManagement.increaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, primaryEvent))
    .then(() => cacheManagement.increaseEventSize(cacheInst.properties.numberOfEvents, primaryEvent))
    .then(() => {
      logger.log('debug', '... Successfully updateed the %s cache with the new record.', primaryEvent)
      return undefined
    })
    .catch(error => {
      throw new Error(util.format('... Failed to update the %s cache with the new record. Details:%s', primaryEvent, error.message))
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

let doesCacheTimeNeedFlush = (logger, cacheInst, mainEvent) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to determine if the data for the %s cache needs to be flushed ...', mainEvent)
      return undefined
    })
    .then(() => cacheManagement.getEventSize(cacheInst.properties.numberOfEvents, mainEvent))
    .then(eventSize => {
      if (eventSize >= cacheInst.config['storage']['policy']['eventLimit']) {
        logger.log('debug', '... The data for the %s cache needs to be flushed', mainEvent)
        return true
      } else {
        logger.log('debug', '... The data for the %s cache does not need to be flushed', mainEvent)
        return false
      }
    })
    .catch(error => {
      throw new Error(util.format('.. Failed to determine if the data for the %s cache needs to be flushed. Details:%s', mainEvent, error.message))
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
    .then(() => cacheManagement.getCacheSize(cacheInst.properties.sizeOfCache))
    .then(cacheSize => {
      if (cacheSize >= cacheInst.config['storage']['byteSizeWatermark']) {
        logger.log('debug', '... The cache needs to be flushed.')
        return true
      } else {
        logger.log('debug', '... The cache does not need to be flushed')
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

let flushTimeCache = (logger, cacheInst, mainEvent) => {
  return (Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to flush the %s cache ...', mainEvent)
      return undefined
    })
    .then(() => cacheManagement.resetEventSize(cacheInst.properties.numberOfEvents, mainEvent))
    .then(() => cacheManagement.resetBufferSize(cacheInst.properties.sizeOfCache, mainEvent))
    .then(() => deleteModule.removeEntryArray(mainEvent, cacheInst.cache))
    .then(cacheData => {
      logger.log('debug', '... Successfully flushed the %s cache.', mainEvent)
      return cacheData
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
            resolve(flushTimeCache(logger, cacheInst, key))
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
*   This method searches for an entry in the cache that is the primary event. This can be used for
*     time and secondary storage policy.
* Args:
*   key (String): This String is the key that the entry could be located in
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

let hasPrimaryEntry = (logger, cache, primaryEvent) => {
  return Promise.resolve()
    .then(() => {
      logger.log('debug', 'Starting to determine if the cache for %s exists ...', primaryEvent)
      return undefined
    })
    .then(() => readModule.readPrimaryEntry(primaryEvent, cache))
    .then(value => {
      if (value === undefined) {
        logger.log('debug', '... The cache for %s exists.', primaryEvent)
        return false
      } else {
        logger.log('debug', '... The cache for %s does not exist.', primaryEvent)
        return true
      }
    })
    .catch(error => {
      throw new Error(util.format('... Failed to determine if the cache for %s exists. Details:%s', primaryEvent, error.message))
    })
}

module.exports = {
  addEntryToCache: addEntryToCache,
  addEntryToTimeCache: addEntryToTimeCache,
  updateEntryToTimeCache: updateEntryToTimeCache,
  doesCacheTimeNeedFlush: doesCacheTimeNeedFlush,
  flushTimeCache: flushTimeCache,
  doesCacheNeedFlush: doesCacheNeedFlush,
  flushCache: flushCache,
  hasPrimaryEntry: hasPrimaryEntry
}
