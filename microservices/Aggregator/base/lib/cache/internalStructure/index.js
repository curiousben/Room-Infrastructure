/*eslint-env node*/
/*eslint no-console:['error', { allow: ['info', 'error'] }]*/

'use strict';

const utilities = require("./utilities/utilities.js")

this.cache = null 
this.cacheMethods = null

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
*
* TODO:
*   [#1]:
*/

let init = (logger, cacheConfig) => {
  return new Promise(
    resolve => {
      logger.debug("Starting to initialize the cache structure...")
      resolve()
    }
  )
  .then(() => validCacheProps(logger, cacheConfig))
  .then(() => {
    this.cache = {},
    this.cacheMethods = {
      "createCacheObj": utilities.createCacheObj,
      "createCacheArray": utilities.createCacheArray,
      "createBufferFromData": utilities.createBufferFromData,
      "getSizeOfBuffer": utilities.getSizeOfBuffer
    }
    logger.debug("... Finished initializing the cache structure.")
    resolve(this)
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

let validCacheProps = (logger, cacheConfig) => {
  return new Promise(
    resolve => {
      logger.debug("Starting to validate rules for the cache structure...")
      let storagePolicy = cacheConfig["storage"]["policy"]
      if (storagePolicy === "secondaryEvent") {
        let secondaryEventPath = cacheConfig["storage"]["eventTrigger"]["secondaryEvent"]
        if (secondaryEventPath.length === 0) {
          throw new Exception("The data path encountered for the cache's secondary event Data storage event trigger was: [" + secondaryEventPath + "]. This data path can not be empty.")
        }
      }

      let waterMark = cacheConfig["storage"]["byteSizeWatermark"]
      if (waterMark < 5000000) {
        throw new Exception("It is recommended to have at least 5MB of space for cached data")
      } else if (100000000 < waterMark) {
        logger.warning("Be mindful that have an internal cache should be used for small caches")
      } else {}
      logger.debug("... Successfully validate rules for the Cache.")
      resolve()
    }
  )
}

// Exports the promise when you create this module
module.exports = {
  init: init
}
