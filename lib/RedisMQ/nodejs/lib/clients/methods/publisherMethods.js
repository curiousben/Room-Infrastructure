/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict';

const MessageError = require('../../errors/messageError.js')

/*
* Description:
*   This promise sends a message that does not exist in a process queue
* Args:
*   client (redisClient): A promisified redis client.
*   queue (String): A string that is the name of the destination queue.
*   address (String): A string that is the key that points to the payload
*   payload (Obj): A flattened redisMQ message object that is going to the sent
* Returns:
*   redisPromise (Promise) An promise that resolves with the results of a successfull publish of a message.
* Throws:
*   MessageError (Error) This error will be thrown if redis fails to receives the message from the client or
*     there are any unexpected results from the redis server
* Notes:
*   Expected results from the redis server is in the form of an array. The first place in the array should be
*     the index(Integer) of the new element of the list. The second place in the array should be an 'OK'
*     string.
* TODO:
*   N/A
*/

let sendNewMsg = (client, queue, address, payload) => {
  return client.multi()
    .lpush(queue, address)
    .hmset(address, payload)
    .execAsync()
    .then(results => {
      if (Number.isInteger(results[0]) && 'OK' === results[1]) {
        return 'OK'
      } else {
        throw new Error('Unexpected results from redis server: ' + results)
      }
    })
    .catch(error => {
      throw new MessageError(error.message)
    })
}

/*
* Description:
*   This promise sends a message that exists in a process queue
* Args:
*   client (redisClient): A promisified redis client.
*   srcQueue (String): A string that is the name of the source queue.
*   destQueue (String): A string that is the name of the destination queue.
*   address (String): A string that is the key that points to the payload
*   payload (Obj): A flattened redisMQ message object that is going to the sent
* Returns:
*   redisPromise (Promise) An promise that resolves with the results of a successfull publish of a message.
* Throws:
*   MessageError (Error) This error will be thrown if redis fails to receives the message from the client or
*     there are any unexpected results from the redis server
* Notes:
*   Expected results from the redis server is in the form of an array. The first place in the array should be
*     1 since that is the how many elements are being removed from the source queue. The second place in the
*     array should be the index(Integer) of the new element of the list. The second place in the array should
*     be an 'OK' string.
*   The eagle eye will note that the Redis command 'RPOPLPUSH' could be used to move message addresses to the
*     destination queue, but we can't be sure that the process queue's last message will always match the
*     message that is being sent since some custom code might process messages in a different order than the
*     source queue.
* TODO:
*   N/A
*/

let sendExistingDirect = (client, srcQueue, destQueue, address, payload) => {
  return client.multi()
    .lrem(srcQueue, -1, address)
    .lpush(destQueue, address)
    .hmset(address, payload)
    .execAsync()
    .then(results => {
      if (1 === results[0] && Number.isInteger(results[1]) && 'OK' === results[2]) {
        return 'OK'
      } else {
        throw new Error('Unexpected results from redis server: ' + results)
      }
    })
    .catch(err => {
      throw new MessageError(err.message)
    })
}

// Export modules
module.exports = {
  sendNewMsg: sendNewMsg,
  sendExistingDirect: sendExistingDirect
}
