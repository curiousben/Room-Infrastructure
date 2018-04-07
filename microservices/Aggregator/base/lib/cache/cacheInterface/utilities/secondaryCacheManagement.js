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

let decreaseEventSize = (cacheNumberOfEvents, mainEvent) => {
  return new Promise(
    resolve => {
      cacheNumberOfEvents['eventCaches'][mainEvent] -= 1
      cacheNumberOfEvents['all'] -= 1
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

let decreaseBufferSize = (cacheSizeOfCache, bufferSize, mainEvent) => {
  return new Promise(
    resolve => {
      cacheSizeOfCache['eventCaches'][mainEvent] -= bufferSize
      cacheSizeOfCache['all'] -= bufferSize
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

let increaseEventSize = (cacheNumberOfEvents, mainEvent) => {
  return new Promise(
    resolve => {
      if (mainEvent in cacheNumberOfEvents['eventCaches']) {
        cacheNumberOfEvents['eventCaches'][mainEvent] += 1
      } else {
        cacheNumberOfEvents['eventCaches'][mainEvent] = 1
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

let increaseBufferSize = (cacheSizeOfCache, bufferSize, mainEvent) => {
  return new Promise(
    resolve => {
      if (mainEvent in cacheSizeOfCache['eventCaches']) {
        cacheSizeOfCache['eventCaches'][mainEvent] += bufferSize
      } else {
        cacheSizeOfCache['eventCaches'][mainEvent] = bufferSize
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

let resetEventSize = (cacheNumberOfEvents, mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      cacheNumberOfEvents['all'] -= cacheNumberOfEvents['eventCaches'][mainEvent]
      delete cacheNumberOfEvents['eventCaches'][mainEvent]
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

let resetBufferSize = (cacheSizeOfCache, mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      cacheSizeOfCache['all'] -= cacheSizeOfCache['eventCaches'][mainEvent]
      delete cacheSizeOfCache['eventCaches'][mainEvent]
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

let getEventSize = (cacheNumberOfEvents, mainEvent) => {
  return new Promise(
    resolve => {
      resolve(cacheNumberOfEvents['eventCaches'][mainEvent])
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

let getCacheSize = (cacheSizeOfCache) => {
  return new Promise(
    resolve => {
      resolve(cacheSizeOfCache['all'])
    }
  )
}

// Exports the promise when you create this module
module.exports = {
  getEventSize: getEventSize,
  getCacheSize: getCacheSize,
  decreaseEventSize: decreaseEventSize,
  increaseEventSize: increaseEventSize,
  decreaseBufferSize: decreaseBufferSize,
  increaseBufferSize: increaseBufferSize,
  resetEventSize: resetEventSize,
  resetBufferSize: resetBufferSize
}
