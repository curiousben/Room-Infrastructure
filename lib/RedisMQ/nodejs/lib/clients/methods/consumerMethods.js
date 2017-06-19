/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
const ValidationError = require('../errors/ValidationError.js')
const InitializationError = require('./lib/errors/initializationError.js')
const ClientError = require('./lib/errors/clientError.js')

function receiveMsg(client, queue, address, payload) {
  client.multi()
    .lpush(queue, address)
    .hmset(address, payload)
    .exec(function (err, replies) {
      if (err){
        throw new ClientError('----ERROR: Failed to send message. Details:\n\t' + String(err));
      }
      return replies;
    });
}

module.exports = {
  receiveMsg: receiveMsg
}
