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

let increaseEventSize = (cacheNumberOfEvents, mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      if (secondaryEvent !== null) { // implies time cache
        if (!(mainEvent in cacheNumberOfEvents['eventCaches'])) {
          cacheNumberOfEvents['eventCaches'][mainEvent] = {}
        }
        if (secondaryEvent in cacheNumberOfEvents['eventCaches'][mainEvent]) {
          cacheNumberOfEvents['eventCaches'][mainEvent][secondaryEventLabel] += 1
        } else {
          cacheNumberOfEvents['eventCaches'][mainEvent][secondaryEventLabel] = 1
        }
      } else {
        if (!(mainEvent in cacheNumberOfEvents['eventCaches'])) {
          cacheNumberOfEvents['eventCaches'][mainEvent] = 1
        } else {
          cacheNumberOfEvents['eventCaches'][mainEvent] += 1
        }
      }
      cacheNumberOfEvents['all'] += 1
      resolve()
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

let increaseBufferSize = (cacheSizeOfCache, bufferSize, mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      if (secondaryEvent !== null) { // implies time cache
        if (!(mainEvent in cacheSizeOfCache['eventCaches'])) {
          cacheSizeOfCache['eventCaches']['mainEvent'] = {}
        }
        if (secondaryEvent in cacheSizeOfCache[mainEvent]) {
          cacheSizeOfCache['eventCaches'][mainEvent][secondaryEventLabel] += bufferSize
        } else {
          cacheSizeOfCache['eventCaches'][mainEvent][secondaryEventLabel] = bufferSize
        }
      } else {
        if (!(mainEvent in thatProperties.sizeOfCache['eventCaches'])) {
          cacheSizeOfCache['eventCaches'][mainEvent] = bufferSize
        } else {
          cacheSizeOfCache['eventCaches'][mainEvent] += bufferSize
        }
      }
      cacheSizeOfCache['all'] += bufferSize
      resolve()
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

let getEventSize = (cacheNumberOfEvents, mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      let eventSize = null
      if (secondaryEvent !== null) { // implies time cache
        eventSize = cacheNumberOfEvents['eventCaches'][mainEvent]
      } else {
        eventSize = cacheNumberOfEvents['eventCaches'][mainEvent][secondaryEvent]
      }
      resolve(eventSize)
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

let getCacheSize = (cacheSizeOfCache, mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      let cacheSize = null
      if (secondaryEvent !== null) { // implies time cache
        cacheSize = cacheSizeOfCache['eventCaches'][mainEvent]
      } else {
        cacheSize = cacheSizeOfCache['eventCaches'][mainEvent][secondaryEvent]
      }
      resolve(cacheSize)
    }
  )
}

// Exports the promise when you create this module
module.exports = {
  getEventSize: getEventSize,
  getCacheSize: getCacheSize,
  increaseEventSize: increaseEventSize,
  increaseBufferSize: increaseBufferSize,
  createCacheObj: createCacheObj,
  createCacheArray: createCacheArray
}
