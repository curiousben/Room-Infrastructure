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

module.exports = {
  receiveMsg: receiveMsg
}
