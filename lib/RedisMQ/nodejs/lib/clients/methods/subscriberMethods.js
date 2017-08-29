/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict'

const MessageError = require('../../errors/messageError.js')

/*
* Description:
*   This promise recieves a message from a source queue and places it in the destination queue then returns
*     the message.
* Args:
*   client (redisClient): A promisified redis client.
*   srcQueue (String): A string that is the name of the source queue.
*   destQueue (String): A string that is the name of the destination queue.
* Returns:
*   redisPromise (Promise) An promise that resolves with the results of a successfull publish of a message.
* Throws:
*   MessageError (Error) This error will be thrown if redis fails to send the message to the client 
* Notes:
*   Since this is not a multi argument there is a chance that if the whole promise doesn't complete there
*     will be commands that are not executed. However, every message will first be put into the process queue
*     which is handled by one Redis command. So if the client crashes midway through the promise, the checking
*     of the process queue on initialization will recover the message
* TODO:
*   N/A
*/

let receiveMsg = (client, srcQueue, destQueue) => {
  return client.brpoplpushAsync(srcQueue, destQueue, 0)
    .then(address => client.hgetallAsync(address))
    .catch(error => {
      throw new MessageError(error.message)
    })
}

/*
* Description:
*   This promise recieves a message from a source queue and places it the process queue only to consume the message.
* Args:
*   client (redisClient): A promisified redis client.
*   srcQueue (String): A string that is the name of the source queue.
*   destQueue (String): A string that is the name of the destination queue.
* Returns:
*   redisPromise (Promise) An promise that resolves with the results of a successfull publish of a message.
* Throws:
*   MessageError (Error) This error will be thrown if redis fails to send the message to the client 
* Notes:
*   While the process queue design looks like it is counter-intuitive but it was choosen for a couple of reasons:
*     1. Since we are listening for messages arriving in the upstream queue, a blocking connection is needed
*       but this can't be implemneted in a batch of commands like lua-Scripts/multi-Function since it will stop
*       the Redis server.
*     2. Due to the previous reason there will be a window where the message was received and was acted on but
*       the client has yet to execute the batched commands. The process queue is a temporary cache until the message
*       has been fully consumed.
* TODO:
*   N/A
*/

let consumeMsg = (client, srcQueue, destQueue) => {
  return client.brpoplpushAsync(srcQueue, destQueue, 0)
    .then(address => client.multi().hgetall(address).lrem(destQueue, -1, address).del(address).execAsync())
    .then(results => results[0])
    .catch(error => {
      throw new MessageError(error.message)
    })
}

/*
* Description:
*   This promise retrieves an message in the process queue at a particular index and returns it.
* Args:
*   client (redisClient): A promisified redis client.
*   queue (String): A string that is the name of the source queue.
*   idx (Integer): An integer that is the index of the process queue where the message is located. 
* Returns:
*   redisPromise (Promise) A promise that resolves with a message from the source queue.
* Throws:
*   MessageError (Error) This error will be thrown if the client fails to retrieve the message from the redis
*     server.
* Notes:
*   Since all commands do not modify the message in anyway on the redis server there overall completion is not
*     needed. If in the event of failure a restart is enough to recover any dropped messages.
* TODO:
*   N/A
*/

let getProcessElements = (client, queue, idx) => {
  return client.lindexAsync(queue, idx)
    .then(address => client.hgetallAsync(address))
    .catch(err => {
      throw new MessageError(err.message)
    })
}

/*
* Description:
*   This promise retrieves an message in the process queue at a particular index and consumes it.
* Args:
*   client (redisClient): A promisified redis client.
*   queue (String): A string that is the name of the source queue.
*   idx (Integer): An integer that is the index of the process queue where the message is located. 
* Returns:
*   redisPromise (Promise) A promise that resolves with a message from the source queue.
* Throws:
*   MessageError (Error) This error will be thrown if the client fails to retrieve the message from the redis
*     server.
* Notes:
*   Simliar to the reasoning above but instead of brpoplpush we use lindex and is program activated instead of
*     Redis activated.
* TODO:
*   N/A
*/

let consumeProcessElements = (client, queue, idx) => {
  return client.lindexAsync(queue, idx)
    .then(address => client.multi().hgetall(address).lrem(queue, -1, address).del(address).execAsync())
    .then(results => results[0])
    .catch(error => {
      throw new MessageError(error.message)
    })
}

/*
* Description:
*   This promise retrieves the length of the process queue.
* Args:
*   client (redisClient): A promisified redis client.
*   queue (String): A string that is the name of a queue.
* Returns:
*   redisPromise (Promise) A promise that resolves with the length of the queue
* Throws:
*   MessageError (Error) This error will be thrown if the client fails to retrieve the length of the queue 
*     from the redis server.
* Notes:
*   Since all commands do not modify the message in anyway on the redis server there overall completion is not
*     needed. If in the event of failure a restart is enough to recover the length of the passed in queue.
* TODO:
*   N/A
*/

let getProcessLength = (client, queue) => {
  return client.llenAsync(queue)
    .catch(err => {
      throw new MessageError(err.message)
    })
}

// Export Functions
module.exports = {
  receiveMsg: receiveMsg,
  consumeMsg: consumeMsg,
  getProcessElements: getProcessElements,
  consumeProcessElements: consumeProcessElements,
  getProcessLength: getProcessLength
}
