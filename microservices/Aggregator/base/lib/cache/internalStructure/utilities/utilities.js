/*eslint-env node*/
/*eslint no-console:['error', { allow: ['info', 'error'] }]*/

'use strict';

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
*   This promise resolves to the amount of space the the Buffered cache is taking up
* Args:
*   cache (Object|Array): This is the cache that is being evaluated.
*   typeOfCache (String): This is the type of cache that is being evaluated.
* Returns:
*   sizeOfCache (Promise): This promise resolves to the size of the cache.
* Throws:
*   N/A
* Notes:
*   If the type is not Object or Array a null will be thrown.
* TODO:
*   [#1]:
*/
let getSizeOfBuffer = (buffer) => {
  return new Promise(
    resolve => {
      resolve(Buffer.byteLength(buffer))
    }
  )
}

let createBufferFromData = (data) => {
  return new Promise(
    resolve => {
      resolve(Buffer.from(data))
    }
  )
}

// Exports the promise when you create this module
module.exports = {
  createCacheObj:  createCacheObj,
  createCacheArray: createCacheArray,
  createBufferFromData: createBufferFromData,
  getSizeOfBuffer: getSizeOfBuffer
}
