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

let initCacheConfiguration = (cacheObj) => {
  return new Promise(
    resolve => {
      // Cache properties
      this.properties["cacheStrategy"] = cacheObj["properties"]["cacheStrategy"]
      this.properties["primaryEvent"] = cacheObj["properties"]["primaryEvent"]
      this.properties["archiveBy"] = cacheObj["properties"]["archiveBy"]
      this.properties["secondaryEvent"] = cacheObj["properties"]["secondaryEvent"]
      this.properties["byteSizeWatermark"] = cacheObj["properties"]["byteSizeWatermark"]
      this.properties["eventLimit"] = cacheObj["properties"]["eventLimit"]
      this.properties["flushOnNewEvent"] = cacheObj["properties"]["flushOnNewEvent"]
      this.properties["flushStrategy"] = cacheObj["properties"]["flushStrategy"]
      // Cache methods
      this.cacheMethods["createObjPromise"] = cacheObj["methods"]["createObjPromise"]
      this.cacheMethods["createArrayPromise"] = cacheObj["methods"]["createArrayPromise"]
      this.cacheMethods["getSizeOfCache"] = cacheObj["methods"]["getSizeOfCache"]
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

let getCacheFunctions = (cacheObj) => {
  return new Promise(
    resolve => {
      console.debug("Starting to get the cache interface functions ...")
      resolve()
    }
  )
  .then(() => initCacheFunctions(cacheObj))
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
      if (value === null) {
        
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
let addEntryToCache = (validConfigJSON) => {
  return new Promise(
    resolve => {
      
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
let updateEntryToCache = (validConfigJSON) => {
  return new Promise(
    resolve => {
            
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
let flushUniqueCache = (validConfigJSON) => {
  return new Promise(
    resolve => {
      
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
let addEntryToCache = (validConfigJSON) => {
  return new Promise(
    resolve => {
      
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
let updateEntryToCache = (validConfigJSON) => {
  return new Promise(
    resolve => {
      
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
let flushCache = (validConfigJSON) => {
  return new Promise(
    resolve => {
      
    }
  )
}


exports.cacheObj
