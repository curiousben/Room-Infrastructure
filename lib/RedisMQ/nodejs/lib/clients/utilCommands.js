/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict'

const MessageError = require('../errors/messageError.js')

/*
* Description:
*   This function executes lua scripts in the redis server by using its hash value.
* Args:
*   client (Redis client): A promisified redis client.
*   hash (String): A string that is the has that was returned from the redis server.
*   numKeys (Integer): A integer with the number of keys expected in the lua script.
*   keys (Array): An array with arguments with the keys for the lua script.
*   args (Array): An array with arguments with the arguments for the lua script.
* Returns:
*   redisPromise (Promise): A promise that resolves with the results of the lua scripts.
* Throws:
*   MessageError (Error): This error is raised when the redis evalsha command works.
* Notes:
*   N/A
* TODO:
*   N/A
*/
let luaHashFunctions = (client, hash, numKeys, keys, args) => {
  return client.evalshaAsync([].concat(hash, numKeys, keys, args))
    .catch(err => {
      throw new MessageError(err.message)
    })
}

// Export Functions
module.exports = {
  luaHashFunctions: luaHashFunctions 
}
