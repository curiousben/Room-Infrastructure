/*eslint-env node*/
/*eslint no-console:['error', { allow: ['info', 'error'] }]*/

'use strict';

const utilities = require("./utilities/utilities.js")

/*
* Description:
*   This Promise returns the cache, the properties, and methods to govern the manangement the structure of the cache.
*     The output will be sololy for library functions to interact with.
* Args:
*   logger (Logger): This is the logger that is provided by external processes
*   configJSON (Obj): This obj has the configurations for the structure of the cache
* Returns:
*   cache (Promise): This Promise resolves to an object that has the cache object and properties
*     that was generated from the configuration like cache size limitation, how to organize data
*     in the cache, flush conditiions, etc. It also has some methods to create sub caches and get sizes of the caches
* Throws:
*   N/A
* Notes:
*   Example output:
    {
	    "cache": {},
	    "methods": {
		    "createObjPromise": "[Function: createObj]",
		    "createArrayPromise": "[Function: createArray]",
        "getSizeOfCache": "[Function: getSizeOfCache]"
	    },
	    "properties": {
		    "cacheStrategy": "singleEvent" or "multiEvent",
		    "primaryEvent": "eventField",
		    "archiveBy": "",
		    "secondaryEvent": "eventField",
		    "byteSizeWatermark": 50000000,
		    "eventLimit": 10,
		    "flushStrategy": ""
	    }
    }
* TODO:
*   [#1]:
*/
let init = (logger, cacheConfig) => {
  return new Promise(
    resolve => {
      logger.debug("Starting to initialize the cache structure...")
      resolve(getCacheProps(logger, cacheConfig))
    }
  )
  .then(cacheProperties => getCacheObj(logger, cacheProperties))
  .then(cacheObj => {
    logger.debug("... Finished initializing the cache structure.")
    resolve(cacheObj)
  })
  .catch(error => {
    logger.debug("Encountered an Error when creating the cache structure. Details:\n\t" + error.message)
    throw error
  })
}

/*
* Description:
*   This promise resolves to an object of properties that governs structures and how the cache can be interacted with.
* Args:
*   logger (Logger): This is the logger that is provided by external processes
*   cacheConfig (Object): This is the cache configuration that the cache's properties will be modeled after.
* Returns:
*   cache (Object): This promise resolves to an object of properties that defines the cache.
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let getCacheProps = (logger, cacheConfig) => {
  return new Promise(
    resolve => {
      logger.debug("Starting to get rules for the cache ...")
      let cacheProperties = {
        "cacheStrategy": cacheConfig["storage"]["strategy"],
        "primaryEvent": cacheConfig["storage"]["eventTrigger"]["primaryEvent"].slice(-1)[0],
        "archiveBy": cacheConfig["storage"]["policy"]["archiveBy"],
        "secondaryEvent": cacheConfig["storage"]["eventTrigger"]["secondaryEvent"].slice(-1)[0],
        "byteSizeWatermark": cacheConfig["storage"]["byteSizeWatermark"],
        "eventLimit": cacheConfig["storage"]["policy"]["eventLimit"],
        "flushStrategy": cacheConfig["flushStrategy"]
      }
      logger.debug("... Successfully generated rules for the Unique Event Cache.")
      resolve(cacheProperties)
    }
  )
}

/*
* Description:
*   This promise resolves to the caching object that has the properties and cache
* Args:
*   logger (Logger): This is the logger that is provided by external processes
*   cacheProperties (Object): This is the cache properties extracted from the configuration file.
* Returns:
*   cacheObj (Object): This promise resolves to the cache Object, properties of a cache, and methods
*     for altering the structure of the cache
* Throws:
*   N/A
* Notes:
*   {}
* TODO:
*   [#1]:
*/
let getCacheObj = (logger, cacheProperties) => {
  return new Promise(
    resolve => {
      logger.debug("Starting to create the Caching Object ...")
      resolve(utilities.createCacheObj())
    }
  )
  .then(cache => {
     let cacheObj = {
        "cache": cache,
        "methods": {
          "createObj": utilities.createCacheObj,
          "createArray": utilities.createCacheArray,
          "getSizeOfCache": utilities.getSizeOfCache
        },
        "properties": cacheProperties
      }
      logger.debug("... Successfully created the Caching Object for the Unique Event Cache.")
      resolve(cacheObj)
  })
 }

// Exports the promise when you create this module
exports.init = init
