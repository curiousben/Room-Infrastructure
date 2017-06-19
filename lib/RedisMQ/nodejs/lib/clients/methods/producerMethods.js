/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const ClientError = require('./lib/errors/clientError.js')

function sendNewMsg (client, queue, address, payload, callback) {
  client.multi()
    .lpush(queue, address)
    .hmset(address, payload)
    .exec(function (err, replies) {
      if (err) {
        return callback(new ClientError('----ERROR: Failed to send message. Details:\n\t' + String(err)), null)
      }
      return callback(null, replies)
    })
}

function sendExistingMsg (client, queue, address, payload, callback) {

}

module.exports = {
  sendNewMsg: sendNewMsg,
  sendExistingMsg: sendExistingMsg
}
