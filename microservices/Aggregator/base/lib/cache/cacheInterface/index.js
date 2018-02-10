/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/

/*
* Module design: 
*   This module will initialize the 
*/

const createModule = require('./methods/createEntry.js')
const readModule = require('./methods/readEntry.js')
const updateModule = require('./methods/updateEntry.js')
const deleteModule = require('./methods/deleteEntry.js')

const utilities = require('./utilities/bufferManagement.js')

this.properties = {}
this.cacheMethods = {}


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

let init = (logger, cacheConfig, cacheMethods) => {
  return new Promise(
    resolve => {
      logger.debug("Cache interface is loading the configurations of the cache ...")
      // Cache properties
      this.properties["storage.strategy"] = cacheConfig["storage"]["strategy"]
      this.properties["storage.policy.archiveBy"] = cacheConfig["storage"]["policy"]["archiveBy"]
      this.properties["storage.policy.eventLimit"] = cacheConfig["storage"]["policy"]["eventLimit"]
      this.properties["storage.eventTrigger.primaryEvent"] = cacheConfig["storage"]["eventTrigger"]["primaryEvent"]
      this.properties["storage.eventTrigger.secondaryEvent"] = cacheConfig["storage"]["eventTrigger"]["secondaryEvent"]
      this.properties["storage.byteSizeWatermark"] = cacheConfig["storage"]["byteSizeWatermark"]
      this.properties["flushStrategy"] = cacheConfig["flushStrategy"]
      this.properties["sizeOfCache"] = 0
      this.properties["numberOfEvents"] = 0
      // Cache methods
      this.cacheMethods["createObjPromise"] = cacheMethods["createObjPromise"]
      this.cacheMethods["createArrayPromise"] = cacheMethods["createArrayPromise"]
      this.cacheMethods["getSizeOfBuffer"] = cacheMethods["getSizeOfBuffer"]
      this.cacheMethods["createBufferFromData"] = cacheMethods["createBufferFromData"]
      logger.debug("... the cache interface has successfully loaded the configurations of the cache")
      resolve()
    }
  )
}

/*
* Description:
*   This method creates the cache inteface methods that allows the developer to interact with the cache
*   with only a handful of methods as oppose to having to juggle multiple methods where careful
*   consideration is needed to adhere to the cache configurations. 
* Args:
*   cacheObj (cacheObj): This Object is the cache object that represents the structure of the cache along
*     with key methods that can change the structure of the cache.
* Returns:
*   cache (Object): This object has the cache and the key methods that the microservice can use to interface
*     with the cache.
* Throws:
*   
* Notes:
*   Example of output:
*     {
*       "addEntryToCache": "[Function]",
*       "updateEntryToCache": "[Function]",
*       "flushCache": "[Function]"
*     }
* TODO:
*   [#1]:
*/

let getCacheFunctions = (logger, cacheObj) => {
  return new Promise(
    resolve => {
      logger.debug("Starting to get the cache interface functions ...")
      resolve()
    }
  )
  .then(() => initCacheFunctions(logger,cacheObj))
  .then(() => {})
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
        if (this.properties["archiveBy"] === "time") {
          return updateEntryToTimeCache(primaryRecordEvntData, data, cache)
        } else if (this.properties["archiveBy"] === "secondaryEvent") {
          return readModule.hasSecondaryEntry(primaryRecordEvntData, secondaryRecordEvntData, cache)
            .then(hasPrimaryEntry => {
              if (hasSecondaryEntry) {
                return updateEntryToSecondCache(primaryDataEvent, secondaryDataEvent, data, cache)
              } else {
                return addEntryToSecondCache(primaryDataEvent, secondaryDataEvent, data, cache)
              }
            })
            .catch(error => {
              throw error
            })
        } else {}
      } else { // This is a new event
        if (this.sizeOfCache === 0) { //The cache has not collected any data and is being initialized
          if (this.properties["archiveBy"] === "time") {
            return addEntryToTimeCache(primaryRecordEvntData, data, cache)
          } else if (this.properties["archiveBy"] === "secondaryEvent") {
            return addEntryToSecondCache(primaryRecordEvntData, secondaryRecordEvntData, data, cache)
          }
        } else { // The cache has previously collected data
          // +++++++ FLUSH
          resolve()
        }
      }
    })
    .catch(error => {
      throw error
    })

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
        if (this.properties["archiveBy"] === "time") {
          return updateEntryToTimeCache(primaryRecordEvntData, data, cache)
        } else if (this.properties["archiveBy"] === "secondaryEvent") {
          return readModule.hasSecondaryEntry(primaryRecordEvntData, secondaryRecordEvntData, cache)
            .then(hasPrimaryEntry => {
              if (hasSecondaryEntry) { // This secondart event has been encountered before
                return updateEntryToSecondCache(primaryDataEvent, secondaryDataEvent, data, cache)
              } else { // This secondary event has been encountered before
                return addEntryToSecondCache(primaryDataEvent, secondaryDataEvent, data, cache)
              }
            })
            .catch(error => {
              throw error
            })
        } else {}
      } else { // This primary event is a new event
        if (this.sizeOfCache === 0) { //The cache has not collected any data and is being initialized
          if (this.properties["archiveBy"] === "time") {
            return addEntryToTimeCache(primaryRecordEvntData, data, cache)
          } else if (this.properties["archiveBy"] === "secondaryEvent") {
            return addEntryToSecondCache(primaryRecordEvntData, secondaryRecordEvntData, data, cache)
          } else {}
        } else { // The cache has previously collected data
          if (this.properties["archiveBy"] === "time") {
            return (primaryRecordEvntData, data, cache)
          } else if (this.properties["archiveBy"] === "secondaryEvent") {
            return (primaryRecordEvntData, secondaryRecordEvntData, data, cache)
          } else {}
        }
      }
    })
    .catch(error => {
      throw error
    })

let addEntryToTimeCache = (primaryEventData, record, cache) => {
  return new Promise.resolve()
    .then(() => this.cacheMethods["createCacheArray"])
    .then(arrayCache => createModule.createCacheEntry(cache, primaryEventData, arrayCache))
    .then(() => this.cacheMethods["createBufferFromData"](record))
    .then(buffer => updateModule.addValueToArray(cache, primaryEventData, buffer))
    .then(buffer => this.cacheMethods["getSizeOfBuffer"](record))
    .then(bufferSize => increaseBufferSize(bufferSize))
    .then(() => increaseEventSize())
    .catch(error => {
      throw error
    })
}

let addEntryToSecondCache = (primaryEventData, secondaryEventData, record, cache) => {
  return new Promise.resolve()
    .then(() => this.cacheMethods["createCacheObj"])
    .then(objCache => createModule.createCacheEntry(cache[primaryEventData], secondaryEventData, objCache))
    .then(() => this.cacheMethods["createBufferFromData"](record))
    .then(buffer => updateModule.addValueToObj(cache[primaryEventData], secondaryEventData, buffer))
    .then(buffer => this.cacheMethods["getSizeOfBuffer"](buffer))
    .then(bufferSize => increaseBufferSize(bufferSize))
    .then(() => increaseEventSize())
    .catch(error => {
      throw error
    })
}

let updateEntryToTimeCache = (primaryEventData, record, cache) => {
  return new Promise.resolve()
    .then(() => this.cacheMethods["createBufferFromData"](record))
    .then(buffer => updateModule.addValueToArray(cache, primaryEventData, buffer))
    .then(buffer => this.cacheMethods["getSizeOfBuffer"](buffer))
    .then(bufferSize => increaseBufferSize(cacheSize, bufferSize))
    .then(() => increaseEventSize())
    .catch(error => {
      throw error
    })
}

let updateEntryToSecondCache = (primaryEventData, secondaryEventData, record, cache) => {
  return new Promise.resolve()
    .then(() => this.cacheMethods["createBufferFromData"](record))
    .then(buffer => updateModule.addValueToObj(cache[primaryEventData], secondaryEventData, buffer))
    .then(buffer => this.cacheMethods["getSizeOfBuffer"](buffer))
    .then(bufferSize => increaseBufferSize(bufferSize))
    .then(() => increaseEventSize())
    .catch(error => {
      throw error
    })
}

let increaseBufferSize = (bufferSize) => {
  return new Promise(
    resolve => {
      this.properties["sizeOfCache"] += bufferSize
      resolve()
    }
  )
}

let increaseEventSize = () => {
  return new Promise(
    resolve => {
      this.properties["numberOfEvents"] += 1
      resolve()
    }
  )
}

let doesCacheNeedFlush = (cache) => {
  return new Promise(
    resolve => {
      let sizeOfCache = this.methods["getSizeOfCache"]
    }
  )
}

let flushCache = (cache) => {
  return new Promise(
    resolve=> {
      
    }
  )
}
