/*eslint-env node*/
/*eslint no-console:['error', { allow: ['info', 'error'] }]*/

'use strict';

/*
* Module design:
*   This module will initialize the internal cache structure and validate the confiurations for the cache
*/

/*
* Description:
*   This Promise returns the cache and if it returned the cache then the cache configurations were validated as well 
* Args:
*   logger (Logger): This is the logger that is provided by external processes
*   configJSON (Obj): This obj has the configurations for the cache
* Returns:
*   cache (Promise): This Promise resolves to an object that has the cache object
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let init = (logger, cacheConfig) => {
  return new Promise(
    resolve => {
      logger.log("log", "Starting to initialize the cache structure...")
      resolve()
    }
  )
  .then(() => validateCacheProps(logger, cacheConfig))
  .then(() => {
    let cache = {},
    logger.log("log", "... Finished initializing the cache structure.")
    resolve(cache)
  })
  .catch(error => {
    logger.log("error","Encountered an Error when creating the cache structure. Details:\n\t%s", error)
    throw error
  })
}

/*
* Description:
*   This promise validates the  properties that governs structure of the cache 
* Args:
*   logger (Logger): This is the logger that is provided by external processes
*   cacheConfig (Object): This is the cache configuration that the cache's properties will be modeled after.
* Returns:
*   N/A 
* Throws:
*   N/A
* Notes:
*   This promise is only here for validation and so nothing will be returned if successful
* TODO:
*   [#1]:
*/

let validateCacheProps = (logger, cacheConfig) => {
  return new Promise(
    resolve => {
      logger.log("debug", "Starting to validate rules for the cache structure...")
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
        logger.log("warn", "Be mindful that have an internal cache should be used for small caches")
      } else {}
      logger.log("debug", "... Successfully validate rules for the Cache.")
      resolve()
    }
  )
}

// Exports the promise when you create this module
module.exports = {
  init: init
}
