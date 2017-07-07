/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

function receiveMsg (client, srcQueue, destQueue, callback) {
  client.brpoplpush(srcQueue, destQueue, 0, function (err, result) {
    if (err) {
      callback(err, null)
    }
    client.hgetall(result, function (err, obj) {
      if (err) {
        callback(err, null)
      } else {
        callback(null, obj)
      }
    })
  })
}

function getProcessElements (client, queue, idx, callback) {
  client.lindex(queue, idx, function (err, processElement) {
    if (err) {
      callback(err, null)
    }
    client.hgetall(processElement, function (err, obj) {
      if (err) {
        callback(err, null)
      } else {
        callback(null, obj)
      }
    })
  })
}

function getProcessLength (client, queue, callback) {
  client.llen(queue, function (err, length) {
    if (err) {
      callback(err, null)
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
