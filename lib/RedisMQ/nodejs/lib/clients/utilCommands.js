/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const MessageError = require('../errors/messageError.js')

let luaHashFunctions = (client, hash, numKeys, keys, args) => {
  return client.evalshaAsync([].concat(hash, numKeys, keys, args))
    .then(res => res)
    .catch(err => {
      throw new MessageError(err.message)
    })
}

module.exports = {
  luaHashFunctions: luaHashFunctions 
}
