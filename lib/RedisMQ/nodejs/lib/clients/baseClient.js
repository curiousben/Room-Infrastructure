/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const redis = require('redis')
const ClientError = require('../errors/clientError.js')

function create (baseConfig, logger, instance) {
  let clientConfig = {
    host: baseConfig['host'],
    port: baseConfig['port'],
    retry_strategy: function (options) {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        logger.error('Failed to connect to server. Retrying in ' + String(baseConfig['retry.interval']) + ' seconds.')
      }
      if ((baseConfig['retry.attempts'] !== null) && (options.attempt > baseConfig['retry.attempts'])) {
        throw new ClientError('----ERROR: Client has failed to reconnect to the Redis server after ' + String(options.attempt) + ' attempts.')
      }
      return 1000 * baseConfig['retry.interval']
    }
  }
  logger.info('The instance \'' + instance + '\' is connecting to:\n Host: ' + String(baseConfig['host']) + '\n Port: ' + String(baseConfig['port']) + '\n Retry.Attempts: ' + String(baseConfig['retry.attempts']) + '\n Retry.Interval: ' + String(baseConfig['retry.interval']))
  return redis.createClient(clientConfig)
}

module.exports = {
  create: create
}
