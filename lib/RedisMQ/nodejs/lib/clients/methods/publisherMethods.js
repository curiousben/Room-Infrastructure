/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const MessageError = require('../../errors/messageError.js')

function sendNewMsg (client, queue, address, payload) {
  return client.multi()
    .lpush(queue, address)
    .hmset(address, payload)
    .execAsync()
    .then(res => res)
}

function sendExistingDirect (client, srcQueue, destQueue, address, payload) {
  return client.muilt()
    .lrem(srcQueue, -1, address)
    .lpush(destQueue, address)
    .hmset(address, payload)
    .execAsync()
    .then(res => res)
}

module.exports = {
  sendNewMsg: sendNewMsg,
  sendExistingDirect: sendExistingDirect
}
