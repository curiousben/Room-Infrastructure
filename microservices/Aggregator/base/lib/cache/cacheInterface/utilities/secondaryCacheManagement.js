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

let increaseEventSize = (cacheNumberOfEvents, mainEvent, secondaryEvent) => {
  return new Promise(
    resolve => {
      if (!(mainEvent in cacheNumberOfEvents['eventCaches'])) {
        cacheNumberOfEvents['eventCaches'][mainEvent] = {}
      }
      if (secondaryEvent in cacheNumberOfEvents['eventCaches'][mainEvent]) {
        cacheNumberOfEvents['eventCaches'][mainEvent][secondaryEvent] += 1
      } else {
        cacheNumberOfEvents['eventCaches'][mainEvent][secondaryEvent] = 1
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
      if (!(mainEvent in cacheSizeOfCache['eventCaches'])) {
        cacheSizeOfCache['eventCaches'][mainEvent] = {}
      }
      if (secondaryEvent in cacheSizeOfCache['eventCaches'][mainEvent]) {
        cacheSizeOfCache['eventCaches'][mainEvent][secondaryEvent] += bufferSize
      } else {
        cacheSizeOfCache['eventCaches'][mainEvent][secondaryEvent] = bufferSize
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
      cacheNumberOfEvents['all'] -= cacheNumberOfEvents['eventCaches'][mainEvent][secondaryEvent]
      delete cacheNumberOfEvents['eventCaches'][mainEvent][secondaryEvent]
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
      cacheSizeOfCache['all'] -= cacheSizeOfCache['eventCaches'][mainEvent][secondaryEvent]
      delete cacheSizeOfCache['eventCaches'][mainEvent][secondaryEvent]
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
      resolve(cacheNumberOfEvents['eventCaches'][mainEvent][secondaryEvent])
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
      resolve(cacheSizeOfCache['eventCaches'][mainEvent][secondaryEvent])
    }
  )
}

// Exports the promise when you create this module
module.exports = {
  getEventSize: getEventSize,
  getCacheSize: getCacheSize,
  increaseEventSize: increaseEventSize,
  increaseBufferSize: increaseBufferSize,
  resetEventSize: resetEventSize,
  resetBufferSize: resetBufferSize
}
