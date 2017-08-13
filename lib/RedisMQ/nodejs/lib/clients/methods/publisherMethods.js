/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const MessageError = require('../../errors/messageError.js')

let sendNewMsg = (client, queue, address, payload) => {
  return client.multi()
    .lpush(queue, address)
    .hmset(address, payload)
    .execAsync()
    .then(res => res)
    .catch(err => {
      throw new MessageError(err.message)
    })
}

let sendExistingDirect = (client, srcQueue, destQueue, address, payload) => {
  return client.multi()
    .lrem(srcQueue, -1, address)
    .lpush(destQueue, address)
    .hmset(address, payload)
    .execAsync()
    .then(res => res)
    .catch(err => {
      throw new MessageError(err.message)
    })
}

//let checkProcessQueue = ()

module.exports = {
  sendNewMsg: sendNewMsg,
  sendExistingDirect: sendExistingDirect
}
