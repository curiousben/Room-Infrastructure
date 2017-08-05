/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const MessageError = require('../../errors/messageError.js')

function receiveMsg (client, srcQueue, destQueue, callback) {
  client.brpoplpushAsync(srcQueue, destQueue, 0)
    .then(result => client.hgetallAsync(result))
    .then(obj => obj)
    .catch(err => new MessageError(err))
}

function getProcessElements (client, queue, idx, callback) {
  client.lindexAsync(queue, idx)
    .then(processElement => client.hgetallAsync(processElement))
    .then(obj => obj)
}

function getProcessLength (client, queue, callback) {
  client.llen(queue, function (err, length) {
    if (err) {
      callback(new MessageError(err), null)
    } else {
      callback(null, length)
    }
  })
}

module.exports = {
  receiveMsg: receiveMsg,
  getProcessElements: getProcessElements,
  getProcessLength: getProcessLength
}
