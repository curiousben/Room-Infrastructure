/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/

/*
* Module design: 
*   This module will be responsible for initializing the correct cache and subsequent methods for interacting
*   with the cache that this microservice is responsible for. The object that will be returned will be the
*   cache (for the internal or external) and methods for interacting with.
*/

const internalCache = require('./internalStructure/index.js');
const externalCache = require('./externalStructure/index.js');
const cacheInterface = require('./cacheInterface/index.js');

let cache = null;

/*
* Description:
*   This function resolves with an object that has the cache and its respective functions that the microservice
*     can interact with.    
* Args:
*   configJSON (Object): This argument is a validated JSON Object that has relevant configuration
* Returns:
*   cache (Promise): This Promise resolves to an cache Object that has the cache and applicable functions to
*     modify the cache.
* Throws:
*   
* Notes:
*   Example of output:
*     {
*       "addEntryToCache": "[Promise]",
*       "updateEntryToCache": "[Promise]",
*       "flushCache": "[Promise]"
*     }
* TODO:
*   [#1]:
*/

let initCache = (logger, configJSON) => {
  return new Promise(
    resolve => {  
      logger.debug("Starting to initialize a Cache client ...")
      resolve()
    }
  )
  .then(() => {
    let cacheType = configJSON["setup"]
    if (cacheType === "internal") {
      logger.debug("... The type of cache is internal ...")
      return new Promise.resolve()
        .then(() => internalCache.init(logger, configJSON))
        .then(cacheObj => {
          cache = cacheObj.cache
          logger.debug("... Internal cache structure has been created ...")
          resolve(cacheObj.cacheMethods)
        })
    } else if (cacheType === "external"){
      logger.debug("... The type of cache is external ...")
      return externalCache.init(logger, configJSON)
    } else {
      throw new Exception("The cache type is invalid expecting \'internal\' or \'external\' but received: " + cacheType)
    }
  })
  .then(cacheMethods => cacheInterface.init(logger, configJSON, cacheMethods))
  .then(cacheClient => {
    logger.debug("... Successfully created a Cache client.")
    resolve(cacheClient)
  })
}

module.exports = {
  "createAggCache" : createAggCache,
  "addEntryToCache": addEntryToCache,
  "updateEntryToCache": updateEntryToCache,
  "flushCache": flushCache
}
