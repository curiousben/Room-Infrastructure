/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict'

const redis = require('redis')
const bluebird = require('bluebird')
const ClientError = require('../errors/clientError.js')

// Promisifing the Redis Client 
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

/*
* Description:
*   This promise recieves a message from a source queue and places it in the destination queue then returns
*     the message.
* Args:
*   brokerConfig (redisClient): A promisified redis client.
*   logger (String): A string that is the name of the source queue.
*   instance (String): A string that has the name of the redis client instance
* Returns:
*   client (RedisClient) A Redis client that is created from the supplied the configuration
* Throws:
*   RedisError (Error) This error will be thrown if redis fails to send the message to the client
* Notes:
*   N/A
* TODO:
*   [#1]:
*     Check to see if the createClient method can be a promise. Try createClientAsync and replace the the 'let'
*       with the return of a promise.
*   [#2]:
*     Need to check the 'retry.interval' to make sure its not zero.
*/

function create (brokerConfig, logger, instance) {
  let clientConfig = {
    host: brokerConfig['host'],
    port: brokerConfig['port'],
    retry_strategy: function (options) {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        logger.error('Failed to connect to server. Retrying in ' + String(brokerConfig['retry.interval']) + ' seconds.')
      }
      if ((brokerConfig['retry.attempts'] !== null) && (options.attempt > brokerConfig['retry.attempts'])) {
        throw new ClientError('----ERROR: Client has failed to reconnect to the Redis server after ' + String(options.attempt) + ' attempts.')
      }
      // [#2]
      return 1000 * brokerConfig['retry.interval']
    }
  }
  logger.info('The instance \'' + instance + '\' is connecting to:\n Host: ' + String(brokerConfig['host']) + '\n Port: ' + String(brokerConfig['port']) + '\n Retry.Attempts: ' + (brokerConfig['retry.attempts'] === null ? 'N/A' : String(brokerConfig['retry.attempts'])) + '\n Retry.Interval: ' + String(brokerConfig['retry.interval']) + ' secs')
  // [#1]
  let client = redis.createClient(clientConfig)
  return client
}

// Exports methods
module.exports = {
  create: create
}
