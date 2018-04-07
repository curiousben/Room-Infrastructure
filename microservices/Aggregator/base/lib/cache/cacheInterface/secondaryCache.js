/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

'use strict'

/*
* Module design:
*   This module will initialize the
*/

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

let addEntryToSecondCache = (cacheInst, primaryEventData, secondaryEventData, record) => {
  return (Promise.resolve()
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
      return undefined
    })
    .catch(error => {
      console.error(error)
      throw error
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

let updateEntryToSecondCache = (cacheInst, primaryEventData, secondaryEventData, record) => {
  let oldRecord = null
  return (Promise.resolve()
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
      return oldRecord
    })
    .catch(error => {
      throw error
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

let doesCacheSecondaryNeedFlush = (cacheInst, mainEvent, secondaryEvent) => {
  return secondaryCacheManagement.getEventSize(cacheInst.properties.numberOfEvents, mainEvent, secondaryEvent)
    .then(eventSize => {
      if (eventSize >= cacheInst.config['storage']['policy']['eventLimit']) {
        return true
      } else {
        return false
      }
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

let doesCacheNeedFlush = (cacheInst) => {
  return secondaryCacheManagement.getCacheSize(cacheInst.properties.sizeOfCache)
    .then(cacheSize => {
      if (cacheSize >= cacheInst.config['storage']['byteSizeWatermark']) {
        return true
      } else {
        return false
      }
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

let flushSecondaryEventCache = (cacheInst, mainEvent) => {
  let eventCacheObj = {}
  return (Promise.resolve()
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
      return finalCache
    })
    .catch(error => {
      throw error
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

let flushCache = (cacheInst) => {
  let cacheObj = {}
  return Promise.resolve()
    .then(() => {
      let promiseArray = []
      for (const [key, value] of Object.entries(cacheInst.cache)) {
        promiseArray.push(new Promise(
          resolve => {
            resolve(flushSecondaryEventCache(cacheInst, key))
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
      return cacheObj
    })
    .catch(error => {
      throw error
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

let hasSecondaryEntry = (key, subKey, cache) => {
  return Promise.resolve()
    .then(() => readModule.readPrimaryEntry(key, cache))
    .then(value => {
      if (value !== undefined) {
        return readModule.readSecondaryEntry(key, subKey, cache)
          .then(subValue => {
            if (subValue === undefined) {
              return false
            } else {
              return true
            }
          })
          .catch(error => {
            throw error
          })
      } else {
        return false
      }
    })
}

module.exports = {
  addEntryToSecondCache: addEntryToSecondCache,
  updateEntryToSecondCache: updateEntryToSecondCache,
  doesCacheSecondaryNeedFlush: doesCacheSecondaryNeedFlush,
  flushSecondaryEventCache: flushSecondaryEventCache,
  hasSecondaryEntry: hasSecondaryEntry,
  doesCacheNeedFlush: doesCacheNeedFlush,
  flushCache: flushCache
}
