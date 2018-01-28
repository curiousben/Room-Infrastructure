/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/

/*
* Module design: 
*   This module will be responsible for initializing the correct cache and subsequent methods for interacting
*   with the cache that this microservice is responsible for. The object that will be returned will be the
*   cache (for the internal) and methods for interacting with.
*/

const perEventCache = require('./internal/perEventCache.js');
const uniqueCache = require('./internal/uniqueCache.js');

let cache = null;

/*
* Description:
*   This function resolves with an object that has the cache and its respective functions that the microservice
*     can interact with.    
* Args:
*   validConfigJSON (Object): This argument is a validated JSON Object that has relevant configuration
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

let createAggCache = (validConfigJSON) => {
  return new Promise(
    resolve => {
      let typeOfCache = validConfigJSON['setup']
      if (typeOfCache === "internal") {
        createInternalCache();
      } else {
        createExternalCache();
      }
      let cacheObj = {
        "cache": cache,
        "addEntryToCache": addEntryToCache,
        "updateEntryToCache": updateEntryToCache,
        "flushCache": flushCache
      }
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

module.exports = {
  "createAggCache" : createAggCache,
  "addEntryToCache": addEntryToCache,
  "updateEntryToCache": updateEntryToCache,
  "flushCache": flushCache
}
