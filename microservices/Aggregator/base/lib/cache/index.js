/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

/*
* Module design:
*   This module will be responsible for initializing the correct cache and subsequent methods for interacting
*   with the cache that this microservice is responsible for. The object that will be returned will be the
*   cache (for the internal or external) and methods for interacting with.
*/

const internalCache = require('./internalStructure/index.js')
const externalCache = require('./externalStructure/index.js')
const cacheInterface = require('./cacheInterface/index.js')

this.cache = null
this.config = {}
this.properties = {}
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
      logger.log('debug', 'Starting to initialize a Cache client ...')
      resolve()
    })
    .then(() => {
      let cacheType = configJSON['setup']
      if (cacheType === 'internal') {
        logger.log('info', '... The type of cache is internal ...')
        return (Promise.resolve()
          .then(() => internalCache.init(this, logger, configJSON))
          .catch(error => {
            throw error
          }))
      } else if (cacheType === 'external') {
        logger.log('info', '... The type of cache is external ...')
        return (Promise.resolve()
          .then(() => externalCache.init(this, logger, configJSON))
          .catch(error => {
            throw error
          }))
      } else {
        throw new Error('The cache type is invalid expecting \'internal\' or \'external\' but received: ' + cacheType)
      }
    })
    .then(() => cacheInterface.init(this, logger))
    .then(() => {
      logger.log('debug', '... Successfully created a Cache client.')
    })
    .catch(error => {
      throw error
    })
}

module.exports = {
  initCache: initCache,
  addEntryToCache: cacheInterface.addEntryToCache,
  flushCache: cacheInterface.flushCache
}
