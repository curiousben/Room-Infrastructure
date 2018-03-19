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
const timeCacheManagement = require('./utilities/timeCacheManagement.js')

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

let addEntryToTimeCache = (that, primaryEventData, record) => {
  return (Promise.resolve()
    .then(() => createModule.createCacheEntry(that.cache, primaryEventData, []))
    .then(() => bufferManagement.createBufferFromString(record))
    .then(buffer => updateModule.addValueToArray(that.cache, primaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromString(record))
    .then(bufferSize => timeCacheManagement.increaseBufferSize(that.properties.sizeOfCache, bufferSize, primaryEventData))
    .then(() => timeCacheManagement.increaseEventSize(that.properties.numberOfEvents, primaryEventData))
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

let addEntryToPrimaryCache = (that, primaryEvent) => {
  return (Promise.resolve()
    .then(() => createModule.createCacheEntry(that.cache, primaryEvent, {})))
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

let updateEntryToTimeCache = (that, primaryEvent, record) => {
  return (Promise.resolve()
    .then(() => bufferManagement.createBufferFromString(record))
    .then(buffer => updateModule.addValueToArray(that.cache, primaryEvent, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromBuffer(buffer))
    .then(bufferSize => timeCacheManagement.increaseBufferSize(that.properties.sizeOfCache, bufferSize, primaryEvent))
    .then(() => timeCacheManagement.increaseEventSize(that.properties.numberOfEvents, primaryEvent))
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
  return new Promise(
    resolve => {
      Promise.all([timeCacheManagement.getEventSize(that.properties.numberOfEvents, mainEvent), timeCacheManagement.getCacheSize(that.properties.sizeOfCache, mainEvent)])
      .then(results => {
        let eventSize = results[0]
        let cacheSize = results[1]
        if (eventSize >= that.config['storage']['policy']['eventLimit'] || cacheSize >= that.config['storage']['byteSizeWatermark']) {
          console.log('return should be true')
          resolve(true)
        } else {
          console.log('return should be false')
          resolve(false)
        }
      })
    }
  )
*
*/

let doesCacheTimeNeedFlush = (that, mainEvent) => {
  return Promise.all([timeCacheManagement.getEventSize(that.properties.numberOfEvents, mainEvent), timeCacheManagement.getCacheSize(that.properties.sizeOfCache, mainEvent)])
    .then(results => {
      let eventSize = results[0]
      let cacheSize = results[1]
      if (cacheSize >= that.config['storage']['byteSizeWatermark'] || eventSize >= that.config['storage']['policy']['eventLimit']) {
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

let flushTimeCache = (that, mainEvent) => {
  return (Promise.resolve()
    .then(() => timeCacheManagement.resetEventSize(that.properties.numberOfEvents, mainEvent))
    .then(() => timeCacheManagement.resetBufferSize(that.properties.sizeOfCache, mainEvent))
    .then(() => deleteModule.removeEntryArray(mainEvent, that.cache))
    .catch(error => {
      throw error
    }))
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

let hasPrimaryEntry = (cache, primaryEvent) => {
  return Promise.resolve()
    .then(() => readModule.readPrimaryEntry(primaryEvent, cache))
    .then(value => {
      if (value === undefined) {
        return false
      } else {
        return true
      }
    })
}

module.exports = {
  addEntryToPrimaryCache: addEntryToPrimaryCache,
  addEntryToTimeCache: addEntryToTimeCache,
  updateEntryToTimeCache: updateEntryToTimeCache,
  doesCacheTimeNeedFlush: doesCacheTimeNeedFlush,
  flushTimeCache: flushTimeCache,
  hasPrimaryEntry: hasPrimaryEntry
}
