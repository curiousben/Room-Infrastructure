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

let init = (logger, cacheObj) => {
  return new Promise(
    resolve => {
      logger.debug("Cache interface is loading the configurations of the cache ...")
      // Cache properties
      this.properties["cacheStrategy"] = cacheObj["properties"]["cacheStrategy"]
      this.properties["primaryEvent"] = cacheObj["properties"]["primaryEvent"]
      this.properties["archiveBy"] = cacheObj["properties"]["archiveBy"]
      this.properties["secondaryEvent"] = cacheObj["properties"]["secondaryEvent"]
      this.properties["byteSizeWatermark"] = cacheObj["properties"]["byteSizeWatermark"]
      this.properties["eventLimit"] = cacheObj["properties"]["eventLimit"]
      this.properties["flushOnNewEvent"] = cacheObj["properties"]["flushOnNewEvent"]
      this.properties["flushStrategy"] = cacheObj["properties"]["flushStrategy"]
      this.properties["sizeOfCache"] = 0
      // Cache methods
      this.cacheMethods["createObjPromise"] = cacheObj["methods"]["createObjPromise"]
      this.cacheMethods["createArrayPromise"] = cacheObj["methods"]["createArrayPromise"]
      this.cacheMethods["getSizeOfBuffer"] = cacheObj["methods"]["getSizeOfBuffer"]
      this.cacheMethods["createBufferFromData"] = cacheObj["methods"]["createBufferFromData"]
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
let processRecord = (data, cache) => {
  return Promise.resolve()
    .then(() => readModule.readEntryObj(data, cache))
    .then(value => {
      switch (this.properties["cacheStrategy"]) {
        case singleEvent:
//            if (this.methods["getSizeOfCache"]) {}
          break
        case multiEvent:
          
          break
      }
    })
    .catch(error => {
      throw error
    })
}

let processRecordSingleCache = (primaryRecordEvntData, secondaryRecordEvntData, data, cache) => {
  return Promise.resolve()
    .then(() => readModule.readPrimaryEntry(primaryRecordEvntData, cache))
    .then(primaryCacheEvntData => {
      if (primaryCacheEvntData === null) {// This is a new event
        if (this.sizeOfCache === 0) { // The cache has not collected any data and is being initialized
          if (this.properties["archiveBy"] === "time") {
            return addEntryToTimeCache(primaryRecordEvntData, data, cache)
          } else if (this.properties["archiveBy"] === "secondaryEvent") {
            return addEntryToSecondCache(primaryRecordEvntData, secondaryRecordEvntData, data, cache)
          }
        } else { // The cache has previously collected data
          // +++++++ FLUSH
          resolve()
        }
      } else { // This event has been encountered before
        if (this.properties["archiveBy"] === "time") {
          return updateEntryToTimeCache(primaryCacheEvntData, data, cache)
        } else if (this.properties["archiveBy"] === "secondaryEvent") {
          return new Promise.resolve()
            .then(() => readModule.readSecondaryEntry(secondaryRecordEvntData, cache))
            .then(secondaryCacheEvntData => {
              if (secondaryCacheEvntData === null) {
                return addEntryToSecondCache(primaryDataEvent, secondaryDataEvent, data, cache)
              } else {
                return updateEntryToSecondCache(primaryDataEvent, secondaryDataEvent, data, cache)
              }
            })
            .catch(error => {
              throw error
            })
        }
      }
    })
    .catch(error => {
      throw error
    })
}

addEntryToTimeCache
addEntryToSecondCache

let updateEntryToTimeCache = (primaryEventData, record, cache) => {
  return new Promise.resolve()
    .then(() => this.cacheMethods["createBufferFromData"](record)
    .then(buffer => {
      cache[primaryEventData] = record
      resolve(buffer)
    })
    .then(buffer => this.cacheMethods["getSizeOfBuffer"](record))
    .then(bufferSize => {
      this.properties["sizeOfCache"] += bufferSize
      resolve()
    })
}

let updateEntryToSecondCache = (primaryEventData, secondaryEventData, record, cache) => {
  return new Promise.resolve()
    .then(() => this.cacheMethods["createBufferFromData"](record)
    .then(buffer => {
      cache[primaryEventData][secondaryEventData] = record
      resolve(buffer)
    })
    .then(buffer => this.cacheMethods["getSizeOfBuffer"](record))
    .then(bufferSize => {
      this.properties["sizeOfCache"] += bufferSize
      resolve()
    })
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
