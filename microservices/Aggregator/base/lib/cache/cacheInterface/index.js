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

this.properties = {}

/*
* Description:
*   This method creates the cache inteface methods that allows the developer to interact with the cache
* Args:
*   cacheObj (cacheObj): This Object is the cache object that represents the structure of the cache along
* Returns:
*   cache (Object): This object has the cache and the key methods that the microservice can use to interface
* Throws:
*
* Notes:
*
* TODO:
*   [#1]:
*/
let init = (logger, cacheConfig) => {
  return new Promise(
    resolve => {
      logger.log('debug', 'Cache interface is loading the configurations of the cache ...')
      // Cache properties
      this.properties['storage.strategy'] = cacheConfig['storage']['strategy']
      this.properties['storage.policy.archiveBy'] = cacheConfig['storage']['policy']['archiveBy']
      this.properties['storage.policy.eventLimit'] = cacheConfig['storage']['policy']['eventLimit']
      this.properties['storage.eventTrigger.primaryEvent'] = cacheConfig['storage']['eventTrigger']['primaryEvent']
      this.properties['storage.eventTrigger.secondaryEvent'] = cacheConfig['storage']['eventTrigger']['secondaryEvent']
      this.properties['storage.byteSizeWatermark'] = cacheConfig['storage']['byteSizeWatermark']
      this.properties['flushStrategy'] = cacheConfig['flushStrategy']
      this.properties['sizeOfCache'] = {
        'all': 0,
        'eventCaches': {}
      }
      this.properties['numberOfEvents'] = {
        'all': 0,
        'eventCaches': {}
      }
      logger.log('debug', '... the cache interface has successfully loaded the configurations of the cache')
      resolve()
    }
  )
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
let addEntryToTimeCache = (primaryEventData, record, cache) => {
  return new (Promise.resolve()
    .then(() => utilities.createCacheArray())
    .then(arrayCache => createModule.createCacheEntry(cache, primaryEventData, arrayCache))
    .then(() => bufferManagement.createBufferFromData(record))
    .then(buffer => updateModule.addValueToArray(cache, primaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBuffer(record))
    .then(bufferSize => increaseBufferSize(bufferSize, primaryEventData, null))
    .then(() => increaseEventSize(primaryEventData, null))
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

let addEntryToSecondCache = (primaryEventData, secondaryEventData, record, cache) => {
  return new (Promise.resolve()
    .then(() => utilities.createCacheObj())
    .then(objCache => createModule.createCacheEntry(cache[primaryEventData], secondaryEventData, objCache))
    .then(() => bufferManagement.createBufferFromData(record))
    .then(buffer => updateModule.addValueToObj(cache[primaryEventData], secondaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBuffer(buffer))
    .then(bufferSize => increaseBufferSize(bufferSize, primaryEventData, secondaryEventData))
    .then(() => increaseEventSize(primaryEventData, secondaryEventData))
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
let addEntryToPrimaryCache = (primaryEventData, cache) => {
  return new (Promise.resolve()
    .then(() => utilities.createCacheObj())
    .then(objCache => createModule.createCacheEntry(cache, primaryEventData, objCache))
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
let updateEntryToTimeCache = (primaryEventData, record, cache) => {
  return new (Promise.resolve()
    .then(() => bufferManagement.createBufferFromData(record))
    .then(buffer => updateModule.addValueToArray(cache, primaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBuffer(buffer))
    .then(bufferSize => increaseBufferSize(bufferSize, primaryEventData, null))
    .then(() => increaseEventSize(primaryEventData, null))
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
let updateEntryToSecondCache = (primaryEventData, secondaryEventData, record, cache) => {
  return new (Promise.resolve()
    .then(() => bufferManagement.createBufferFromData(record))
    .then(buffer => updateModule.addValueToObj(cache[primaryEventData], secondaryEventData, buffer))
    .then(buffer => bufferManagement.getSizeOfBuffer(buffer))
    .then(bufferSize => increaseBufferSize(bufferSize, primaryEventData, secondaryEventData))
    .then(() => increaseEventSize(primaryEventData, secondaryEventData))
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
let increaseBufferSize = (bufferSize, mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      if (secondaryEvent !== null) { // implies time cache
        if (!(mainEvent in this.properties.sizeOfCache.eventCaches)) {
          this.properties.sizeOfCache.eventCaches.mainEvent = {}
        }
        if (secondaryEvent in this.properties.sizeOfCache.mainEvent) {
          this.properties.sizeOfCache.eventCaches.mainEvent.secondaryEventLabel += bufferSize
        } else {
          this.properties.sizeOfCache.eventCaches.mainEvent.secondaryEventLabel = bufferSize
        }
      } else {
        if (!(mainEvent in this.properties.sizeOfCache.eventCaches)) {
          this.properties.sizeOfCache.eventCaches.mainEvent = bufferSize
        } else {
          this.properties.sizeOfCache.eventCaches.mainEvent += bufferSize
        }
      }
      this.properties.sizeOfCache.all += bufferSize
      resolve()
    }
  )
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
let increaseEventSize = (mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      if (secondaryEvent !== null) { // implies time cache
        if (!(mainEvent in this.properties.numberOfEvents.eventCaches)) {
          this.properties.numberOfEvents.eventCaches.mainEvent = {}
        }
        if (secondaryEvent in this.properties.numberOfEvents.mainEvent) {
          this.properties.numberOfEvents.eventCaches.mainEvent.secondaryEventLabel += 1
        } else {
          this.properties.numberOfEvents.eventCaches.mainEvent.secondaryEventLabel = 1
        }
      } else {
        if (!(mainEvent in this.properties.numberOfEvents.eventCaches)) {
          this.properties.numberOfEvents.eventCaches.mainEvent = 1
        } else {
          this.properties.numberOfEvents.eventCaches.mainEvent += 1
        }
      }
      this.properties.numberOfEvents.all += 1
      resolve()
    }
  )
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
let flushCache = (cache, mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      let cacheData = null
      // 1. Determine how to reset by what parameters are passed in
      if (secondaryEvent !== null) {
        // 1. Subtract secondaryEvent event count from all section
        this.properties.numberOfEvents.all -= this.properties.numberOfEvents.eventCaches.mainEvent.secondaryEvent
        // 2. Wax secondaryEvent object section in eventcache metadata
        delete this.properties.numberOfEvents.eventCaches.mainEvent.secondaryEvent
        // 3. Subtract secondaryEvent cache size from all section
        this.properties.sizeOfCache.all -= this.properties.sizeOfCache.eventCaches.mainEvent.secondaryEvent
        // 4. Wax secondaryEvent object section in cachecache metadata
        delete this.properties.sizeOfCache.eventCaches.mainEvent.secondaryEvent
        // 5. Extract cache data
        cacheData = cache.mainEvent.secondaryEvent
        // 6. Delete data section in cache
        delete cache.mainEvent.secondaryEvent
      } else {
        // 1. Subtract mainEvent count from all section
        this.properties.numberOfEvents.all -= this.properties.numberOfEvents.eventCaches.mainEvent
        // 2. Wax mainEvent object section in eventcache metadata
        delete this.properties.numberOfEvents.eventCaches.mainEvent
        // 3. Subtract mainEvent cache size from all section
        this.properties.sizeOfCache.all -= this.properties.sizeOfCache.eventCaches.mainEvent
        // 4. Wax mainEvent object section in cachecache metadata
        delete this.properties.sizeOfCache.eventCaches.mainEvent
        // 5. Extract cache data
        cacheData = cache.mainEvent.secondaryEvent
        // 6. Delete data section in cache
        delete cache.mainEvent.secondaryEvent
      }
      // 2. Return cache data
      resolve(cacheData)
    }
  )
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
let getCacheSize = (mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      let cacheSize = null
      if (secondaryEvent !== null) { // implies time cache
        cacheSize = this.properties.sizeOfCache.eventCaches.mainEvent
      } else {
        cacheSize = this.properties.sizeOfCache.eventCaches.mainEvent.secondaryEvent
      }
      resolve(cacheSize)
    }
  )
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
let getEventSize = (mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      let eventSize = null
      if (secondaryEvent !== null) { // implies time cache
        eventSize = this.properties.numberOfEvents.eventCaches.mainEvent
      } else {
        eventSize = this.properties.numberOfEvents.eventCaches.mainEvent.secondaryEvent
      }
      resolve(eventSize)
    }
  )
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
let processRecordMultiCache = (primaryRecordEvntData, secondaryRecordEvntData, data, cache) => {
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
  init: init,
  processRecordSingleCache: processRecordSingleCache,
  processRecordMultiCache: processRecordMultiCache
}
