/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

'use strict'

/*
* Module design:
*   This module houses the utility functions that allows interactions
*     with the structure of the cache
*/

/*
* Description:
*   This promise resolves to the raw cache object.
* Args:
*   N/A
* Returns:
*   cache (Object): This promise resolves to the raw cache object.
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let createCacheObj = () => {
  return new Promise(
    resolve => {
      let cache = {}
      resolve(cache)
    }
  )
}

/*
* Description:
*   This promise resolves to the raw cache array.
* Args:
*   N/A
* Returns:
*   cacheObj (Array): This promise resolves to the raw cache Array.
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let createCacheArray = () => {
  return new Promise(
    resolve => {
      let cache = []
      resolve(cache)
    }
  )
}

// Exports the promise when you create this module
module.exports = {
  createCacheObj: createCacheObj,
  createCacheArray: createCacheArray
}
