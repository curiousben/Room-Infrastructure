/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const initialization = require('./lib/initialization.js')
const msgUtils = require('./lib/msgUtils.js')
const baseClient = require('./lib/clients/baseClient.js')
const publisherMethods = require('./lib/clients/methods/publisherMethods.js')
const consumerMethods = require('./lib/clients/methods/consumerMethods.js')
const MalformedMsgError = require('./lib/errors/malformedMsgError.js')
const InitializationError = require('./lib/errors/initializationError.js')
/* Global Variables
*
* Description:
*   These variables should be used in all future client constructions. This is not forced however,
*   if there is a need to create a client with credntials not found in the 'configData' then the
*   programmer needs to provide an object with proper config variables.
*
*/
let configData = null
let logger = null

/*
* Description:
*   This function loads the configuration file and stores it in the variable configData in a synchronus way.
* Args:
*   redisMQConfig (String): The path to the redisMQ configuration file
*   loggerConfig (String): The path to the logger configuration file
* Returns:
*   N/A
* Throws:
*   InitializationError: (Error Obj): This custom error signifies there was an error when validating the configurations that was passed in.
*/
function init (redisMQConfig, loggerConfig) {
  try {
    let redisMQConfigObj = initialization.readConfig(redisMQConfig)
    let loggerConfigObj = initialization.readConfig(loggerConfig)
    configData = initialization.validateRedisMQConfig(redisMQConfigObj)
    logger = initialization.createLogger(loggerConfigObj)
  } catch (err) {
    throw err
  }
}

function Publisher (configKey) {
  if (configData === null) {
    logger.error('RedisMQ client has not loaded its config file')
    throw new InitializationError('----ERROR: RedisMQ client has not loaded its config file')
  }
  if (logger === null) {
    console.error('----ERROR: Logger has not been initialized')
    throw new InitializationError('----ERROR: Logger has not been initialized')
  } else {
    this.logger = logger
    this.logger.info('Logger for the \'' + configKey + '\' publisher has been configured', {'publisher': configKey})
  }
  if (!(configData['publishers'].hasOwnProperty(configKey))) {
    logger.error('The Key: ' + configKey + ' is not in the publishers section of the loaded config file')
    throw new InitializationError('----ERROR: The Key: ' + configKey + ' is not in the publishers section of the loaded config file')
  } else {
    this.publisherConfig = configData[configKey]
    this.logger.info('Configuration for the \'' + configKey + '\' publisher has been loaded', {'publisher': configKey})
  }
  
  try {
    this.publisher = baseClient.create(configData['broker'], this.logger, configKey)
    this.logger.info('The \'' + configKey + '\' publisher instance has succesfully connected to the Redis Broker', {'publisher': configKey})
  } catch (err) {
    logger.error('Failed to instantiate the publisher. Details:\n\t' + err.message)
    throw new InitializationError('----ERROR: Failed to instantiate the publisher. Details:\n\t' + err.message)
  }
}

Publisher.prototype.send = function (payload, callback) {
  msgUtils.hasOnlyMetadata(payload, function (onlyMetaData) {
    if (onlyMetaData) {
      msgUtils.flatten('', payload, function (flatMsg) {
        publisherMethods.sendExistingMsg(this.publisher, this.publisherConfig['topic'], payload['address'], flatMsg, function (err, results) {
          if (err) {
            callback(err, null)
          } else {
            callback(null, results)
          }
        })
      })
    } else {
      msgUtils.hasPartialMetadata(payload, function (partial) {
        if (partial) {
          callback(new MalformedMsgError('----ERROR: \'' + String(payload) + '\' has a malformed metadata.'), null)
        } else {
          msgUtils.createRedisMQMsg(payload, function (newMsg) {
            msgUtils.flatten('', newMsg, function (flatNewMsg) {
              publisherMethods.sendNewMsg(this.publisher, this.publisherConfig['topic'], newMsg['address'], flatNewMsg, function (err, results) {
                if (err) {
                  callback(err, null)
                } else {
                  callback(null, results)
                }
              })
            })
          })
        }
      })
    }
  })
}

function Subscriber (configKey) {
  if (configData === null) {
    logger.error('RedisMQ client has not loaded its config file')
    throw new InitializationError('----ERROR: RedisMQ client has not loaded its config file')
  }
  if (!(configData['consumers'].hasOwnProperty(configKey))) {
    logger.error('The Key: ' + configKey + ' is not in the consumers section of the loaded config file')
    throw new InitializationError('----ERROR: The Key: ' + configKey + ' is not in the consumers section of the loaded config file')
  }
  try {
    this.consumerConfig = configData[configKey]
    this.consumer = baseClient.create(configData['broker'])
  } catch (err) {
    logger.error('Failed to instantiate the consumer. Details:\n\t' + err.message)
    throw new InitializationError('----ERROR: Failed to instantiate the consumer. Details:\n\t' + err.message)
  }
}

Subscriber.prototype.startConsuming = function (topic, callback) {

}

// TODO: Need to add listners for start consuming function

exports.createPublisher = function (configKey) {
  return new Publisher(String(configKey))
}
exports.createSubscriber = function (configKey) {
  return new Subscriber(String(configKey))
}
exports.init = function (redisMQConfig, loggerConfig) {
  init (redisMQConfig, loggerConfig)
}
//module.exports = {
//  config: configData,
//  init: init
//}
