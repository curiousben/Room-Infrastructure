/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const MessageError = require('../../errors/messageError.js')

function receiveMsg (client, srcQueue, destQueue) {
  return client.brpoplpushAsync(srcQueue, destQueue, 0)
    .then(result => client.hgetallAsync(result))
    .then(obj => obj)
    .catch(err => new MessageError(err.message))
}

function getProcessElements (client, queue, idx) {
  return client.lindexAsync(queue, idx)
    .then(processElement => client.hgetallAsync(processElement))
    .then(obj => obj)
    .catch(err => new MessageError(err.message))
}

function getProcessLength (client, queue) {
  return client.llenAsync(queue)
    .then(len => len)
    .catch(err => new MessageError(err.message))
}

module.exports = {
  receiveMsg: receiveMsg,
  getProcessElements: getProcessElements,
  getProcessLength: getProcessLength
}
