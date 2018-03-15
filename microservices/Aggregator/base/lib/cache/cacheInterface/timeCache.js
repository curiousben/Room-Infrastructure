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
    .then(() => bufferManagement.createBufferFromData(record))
    .then(buffer => updateModule.addValueToArray(that.cache, primaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBuffer(record))
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

let addEntryToPrimaryCache = (that, primaryEventData) => {
  return (Promise.resolve()
    .then(() => createModule.createCacheEntry(that.cache, primaryEventData, {}))
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

let updateEntryToTimeCache = (that, primaryEventData, record) => {
  return (Promise.resolve()
    .then(() => bufferManagement.createBufferFromData(record))
    .then(buffer => updateModule.addValueToArray(that.cache, primaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBuffer(buffer))
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

let doesCacheTimeNeedFlush = (that, mainEvent) => {
  return Promise.all([timeCacheManagement.getEventSize(that.properties.sizeOfCache, mainEvent), timeCacheManagement.getCacheSize(that.properties.sizeOfCache, mainEvent)])
    .then(results => {
      let doesCacheNeedFlush = false
      let eventSize = results[0]
      let cacheSize = results[1]
      if (eventSize >= that.config['storage']['policy']['eventLimit'] || cacheSize >= that.properties['storage']['byteSizeWatermark']) {
        doesCacheNeedFlush = true
      }
      return doesCacheNeedFlush
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

let flushTimeCache = (that, cache, mainEvent) => {
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

let hasPrimaryEntry = (key, cache) => {
  return Promise.resolve()
    .then(() => readModule.readPrimaryEntry(key, cache))
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
