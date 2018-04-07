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

let addEntryToTimeCache = (cacheInst, primaryEventData, record) => {
  return (Promise.resolve()
    .then(() => createModule.createCacheEntry(cacheInst.cache, primaryEventData, []))
    .then(() => bufferManagement.createBufferFromString(record))
    .then(buffer => updateModule.addValueToArray(cacheInst.cache, primaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromString(record))
    .then(bufferSize => timeCacheManagement.increaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, primaryEventData))
    .then(() => timeCacheManagement.increaseEventSize(cacheInst.properties.numberOfEvents, primaryEventData))
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

let addEntryToPrimaryCache = (cacheInst, primaryEvent) => {
  return (Promise.resolve()
    .then(() => createModule.createCacheEntry(cacheInst.cache, primaryEvent, {})))
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

let updateEntryToTimeCache = (cacheInst, primaryEvent, record) => {
  return (Promise.resolve()
    .then(() => bufferManagement.createBufferFromString(record))
    .then(buffer => updateModule.addValueToArray(cacheInst.cache, primaryEvent, buffer))
    .then(buffer => bufferManagement.getSizeOfBufferFromBuffer(buffer))
    .then(bufferSize => timeCacheManagement.increaseBufferSize(cacheInst.properties.sizeOfCache, bufferSize, primaryEvent))
    .then(() => timeCacheManagement.increaseEventSize(cacheInst.properties.numberOfEvents, primaryEvent))
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

let doesCacheTimeNeedFlush = (cacheInst, mainEvent) => {
  return Promise.all([timeCacheManagement.getEventSize(cacheInst.properties.numberOfEvents, mainEvent), timeCacheManagement.getCacheSize(cacheInst.properties.sizeOfCache, mainEvent)])
    .then(results => {
      let eventSize = results[0]
      let cacheSize = results[1]
      if (cacheSize >= cacheInst.config['storage']['byteSizeWatermark'] || eventSize >= cacheInst.config['storage']['policy']['eventLimit']) {
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

let flushTimeCache = (cacheInst, mainEvent) => {
  return (Promise.resolve()
    .then(() => timeCacheManagement.resetEventSize(cacheInst.properties.numberOfEvents, mainEvent))
    .then(() => timeCacheManagement.resetBufferSize(cacheInst.properties.sizeOfCache, mainEvent))
    .then(() => deleteModule.removeEntryArray(mainEvent, cacheInst.cache))
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
