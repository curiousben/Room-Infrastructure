/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const redis = require('redis')
const ClientError = require('./lib/errors/clientError.js')

function create (baseConfig, logger) {
  let clientConfig = {
    host: baseConfig['host'],
    port: baseConfig['port'],
    retry_strategy: function (options) {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        logger.error('----ERROR: Failed to connect to server. Retrying in ' + String(1000 * baseConfig['retry.interval']) + ' seconds.')
      }
      if ((baseConfig['retry.attempts'] !== null) && (options.attempt > baseConfig['retry.attempts'])) {
        throw new ClientError('----ERROR: Client has failed to reconnect to the Redis server after ' + String(baseConfig['retry.attempts']) + ' attempts.')
      }
      return 1000 * baseConfig['retry.interval']
    }
  }
  return redis.createClient(clientConfig)
}

module.exports = {
  create: create
}
