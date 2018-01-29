/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/

/*
* Module design: 
*   This module will be responsible for adding entrys into the internal cache.
*/

"use strict";

/*
* Description:
*   This method read an key-value pair from an existing key-value cache
* Args:
*   key (String): This String is the key that the entry will be associated with
*   cache (Object): This Object is the internal cache that is being added to
* Returns:
*   value (Promise): This promise resolves to the value that is found in that part of the
*     cache is requested
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let readEntryObj = (key, cache) => {
  return new Promise(
    resolve => {
      let value = cache[key]
      if (value === undefined) {
        value = null
      }
      resolve(value)
    }
  )
}

/*
* Description:
*   This method returns the whole cache array of data.
* Args:
*   cache (Array): This Array is the internal cache that is going to be read.
* Returns:
*   cache (Promise): This Promise resolves to an Array that is a readable cache.
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let readEntryArray = (cache) => {
  return new Promise(
    resolve => {
      resolve(cache);
    }
  )
}

// Module for raw read methods for caching
module.exports = {
  readEntryObj: readEntryObj,
  readEntryArray: readEntryArray
}
