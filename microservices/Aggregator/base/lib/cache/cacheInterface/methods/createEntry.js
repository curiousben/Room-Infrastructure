/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/

/*
* Module design: 
*   This module will be responsible for adding values into the internal cache.
*/

"use strict";

/*
* Description:
*   This method adds a key-value pair to the existing cache
* Args:
*   key (String): This String is the key that the value will be associated with
*   value (String): This String is the value that the key will be mapped to
*   cache (Object): This Object is the internal cache that will be added to
* Returns:
*   cache (Object): This Object is the cache after the value has been added
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*     Decrease memory footprint that the cache will take up when adding Strings
*/

let addEntryObj = (key, value, cache) => {
  return new Promise(
    resolve => {
      cache[key] = value
      resolve(cache)
    }
  )
}

/*
* Description:
*   This method adds an whole stringified value to the cache.
* Args:
*   value (String): This String is the value that will be added to the cache
*   cache (Array): This Array is the internal cache that will be have the value be added to it
* Returns:
*   cache (Promise): This Promise resolves to a cache Array is that has had the value added to it
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*     Decrease memory footprint that the cache will take up when adding Strings
*/

let addEntryArray = (value, cache) => {
  return new Promise(
    resolve => {
      cache.put(value);
      resolve(cache);
    }
  )
}

// Module for raw create methods for caching
module.exports = {
  addEntryObj: addEntryObj,
  addEntryArray: addEntryArray
}
