/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const MessageError = require('../../errors/messageError.js')

function sendNewMsg (client, queue, address, payload, callback) {
  client.multi()
    .lpush(queue, address)
    .hmset(address, payload)
    .exec(function (err, replies) {
      if (err) {
        return callback(new MessageError(err.message))
      }
      return callback(null, replies)
    })
}

function sendExistingDirect (client, srcQueue, destQueue, address, payload, callback) {
  client.muilt()
    .lrem(srcQueue, -1, address)
    .lpush(destQueue, address)
    .hmset(address, payload)
    .exec(function (err, replies) {
      if (err) {
        return callback(new MessageError(err.message), null)
      } else {
        return callback(null, replies)
      }
    })
}

module.exports = {
  sendNewMsg: sendNewMsg,
  sendExistingDirect: sendExistingDirect
}
