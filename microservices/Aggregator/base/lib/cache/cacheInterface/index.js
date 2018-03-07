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
const utilities = require('./utilities/utilities.js')

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
  return new (Promise.resolve()
    .then(() => utilities.createCacheArray())
    .then(arrayCache => createModule.createCacheEntry(that.cache, primaryEventData, arrayCache))
    .then(() => bufferManagement.createBufferFromData(record))
    .then(buffer => updateModule.addValueToArray(that.cache, primaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBuffer(record))
    .then(bufferSize => increaseBufferSize(that.properties.sizeOfCache, bufferSize, primaryEventData, null))
    .then(() => increaseEventSize(that.properties.numberOfEvents, primaryEventData, null))
    .catch(error => {
      throw error
    }))()
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

let addEntryToSecondCache = (that, primaryEventData, secondaryEventData, record) => {
  return (Promise.resolve()
    .then(() => utilities.createCacheObj())
    .then(objCache => createModule.createCacheEntry(that.cache[primaryEventData], secondaryEventData, objCache))
    .then(() => bufferManagement.createBufferFromData(record))
    .then(buffer => updateModule.addValueToObj(that.cache[primaryEventData], secondaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBuffer(buffer))
    .then(bufferSize => increaseBufferSize(that.properties.sizeOfCache, bufferSize, primaryEventData, secondaryEventData))
    .then(() => increaseEventSize(that.properties.numberOfEvents, primaryEventData, secondaryEventData))
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
    .then(() => utilities.createCacheObj())
    .then(objCache => createModule.createCacheEntry(that.cache, primaryEventData, objCache))
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
  return new (Promise.resolve()
    .then(() => bufferManagement.createBufferFromData(record))
    .then(buffer => updateModule.addValueToArray(that.cache, primaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBuffer(buffer))
    .then(bufferSize => increaseBufferSize(that.properties.sizeOfCache, bufferSize, primaryEventData, null))
    .then(() => increaseEventSize(that.properties.numberOfEvents, primaryEventData, null))
    .catch(error => {
      throw error
    }))()
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

let updateEntryToSecondCache = (that, primaryEventData, secondaryEventData, record) => {
  return (Promise.resolve()
    .then(() => bufferManagement.createBufferFromData(record))
    .then(buffer => updateModule.addValueToObj(that.cache[primaryEventData], secondaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBuffer(buffer))
    .then(bufferSize => increaseBufferSize(that.properties.sizeOfCache, bufferSize, primaryEventData, secondaryEventData))
    .then(() => increaseEventSize(that.properties.numberOfEvents, primaryEventData, secondaryEventData))
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

let doesCacheNeedFlush = (mainEvent, secondaryEvent) => {
  return Promise.all([getEventSize(mainEvent, secondaryEvent), getCacheSize(mainEvent, secondaryEvent)])
    .then(results => {
      let doesCacheNeedFlush = false
      let eventSize = results[0]
      let cacheSize = results[1]
      if (eventSize >= this.properties['storage.policy.eventLimit'] || cacheSize >= this.properties['storage.byteSizeWatermark']) {
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

let flushSecondaryEventCache = (cache, mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      // 1. Subtract secondaryEvent event count from all section
      this.properties.numberOfEvents.all -= this.properties.numberOfEvents.eventCaches.mainEvent.secondaryEvent
      // 2. Wax secondaryEvent object section in eventcache metadata
      delete this.properties.numberOfEvents.eventCaches.mainEvent.secondaryEvent
      // 3. Subtract secondaryEvent cache size from all section
      this.properties.sizeOfCache.all -= this.properties.sizeOfCache.eventCaches.mainEvent.secondaryEvent
      // 4. Wax secondaryEvent object section in cachecache metadata
      delete this.properties.sizeOfCache.eventCaches.mainEvent.secondaryEvent
      resolve()
    }
  )
  .then(() => deleteModule.removeEntryObj(mainEvent, secondaryEvent, cache))
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

let flushTimeCache = (cache, mainEvent) => {
  return new Promise(
    resolve => {
      // 1. Subtract secondaryEvent event count from all section
      this.properties.numberOfEvents.all -= this.properties.numberOfEvents.eventCaches.mainEvent
      // 2. Wax secondaryEvent object section in eventcache metadata
      delete this.properties.numberOfEvents.eventCaches.mainEvent
      // 3. Subtract secondaryEvent cache size from all section
      this.properties.sizeOfCache.all -= this.properties.sizeOfCache.eventCaches.mainEvent
      // 4. Wax secondaryEvent object section in cachecache metadata
      delete this.properties.sizeOfCache.eventCaches.mainEvent
      resolve()
    }
  )
  .then(() => deleteModule.removeEntryArray(mainEvent, cache))
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

let processRecordSingleCache = (primaryRecordEvntData, secondaryRecordEvntData, data, cache) => {
  return Promise.resolve()
    .then(() => readModule.hasPrimaryEntry(primaryRecordEvntData, cache))
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
  processRecordSingleCache: processRecordSingleCache,
  processRecordMultiCache: processRecordMultiCache
}
