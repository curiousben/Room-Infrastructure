/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const redis = require('redis')
const bluebird = require('bluebird')
const ClientError = require('../errors/clientError.js')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

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
      return 1000 * brokerConfig['retry.interval']
    }
  }
  logger.info('The instance \'' + instance + '\' is connecting to:\n Host: ' + String(brokerConfig['host']) + '\n Port: ' + String(brokerConfig['port']) + '\n Retry.Attempts: ' + String(brokerConfig['retry.attempts']) + '\n Retry.Interval: ' + String(brokerConfig['retry.interval']))
  let client = redis.createClient(clientConfig)
  return client
}

module.exports = {
  create: create
}
