/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/

/*
* Module design: 
*   This module will be responsible for adding entrys into the internal cache.
*/

"use strict";

/*
* Description:
*   This method searches for an entry in the cache that is the primary event. This can be used for
*     time and secondary storage policy.
* Args:
*   key (String): This String is the key that the entry could be located in
*   cache (Object): This Object is the internal cache that is being searched
* Returns:
*   result (Promise): This promise resolves to the boolean value of whether the value exists in the cache
* Throws:
*   N/A
* Notes:
*   To work around a for loop that searchs the whole Object we suppose the value exists and change the boolean
*     statement if it is false.
* TODO:
*   [#1]:
*/

let hasPrimaryEntry = (key, cache) => {
  return new Promise(
    resolve => {
      let value = cache[key]
      let result = true
      if (value === undefined) {
        result = false
      }
      resolve(result)
    }
  )
  .catch(error => {
    throw error
  })
}

/*
* Description:
*   This method searches for an entry in the cache that is the secondary event. This only makes sense
*     if used for secondary strorage policy.
* Args:
*   key (String): This String is the key that represents the primary event.
*   subkey (String): This String is the key that represents the secondary event.
*   cache (Object): This Object is the internal cache that is being searched
* Returns:
*   result (Promise): This promise resolves to the boolean value of whether the value exists in the cache
* Throws:
*   N/A
* Notes:
*   To work around a for loop that searchs the whole Object we suppose the value exists and change the boolean
*     statement if it is false.
* TODO:
*   [#1]:
*/

let hasSecondaryEntry = (key, subKey, cache) => {
  return new Promise(
    resolve => {
      let result = true
      let subValue = cache[key][subKey]
      if (subValue === undefined) {
        result = false
      }
      resolve(result)
    }
  )
  .catch(error => {
    throw error
  })
}

// Module for raw read methods for caching
module.exports = {
  hasSecondaryEntry: searchSecondaryEntry,
  hasPrimaryEntry: searchPrimaryEntry,
}
