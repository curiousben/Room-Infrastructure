/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict'

const InitializationError = require('./errors/initializationError.js')
const winston = require('winston')
const fs = require('fs')
const jsonfile = require('jsonfile')
const path = require('path')

function readConfig (filepath) {
  let realFilePath = null
  let configObj = null
  // Checks to see if the filepath passed in a string
  if (typeof filepath !== 'string') {
    throw new InitializationError('----ERROR: ' + filepath + ' was passed in and is not a file path string.')
  }
  // Determines the absolute path to the config file
  if (fs.existsSync(filepath)) {
    realFilePath = filepath
  } else if (fs.existsSync(path.join(__dirname, filepath))) {
    realFilePath = path.join(__dirname, filepath)
  } else {
    throw new InitializationError('----ERROR: Config file doesn\'t exist at the path:\n\t' + filepath)
  }
  // Reads and Loads the configuration file from the abosolute filepath
  try {
    configObj = jsonfile.readFileSync(realFilePath)
  } catch (err) {
    throw new InitializationError('----ERROR: Failed to read the configuration file: Details:\n\t' + err.message)
  }
  return configObj
}

/*
* Description:
*   This function creates a winston logger and passes back a logger instance.
* Agruments:
*   filePath (String): An absolute path that has the logger config file.
* Return:
*   logger (Winston Logger Instance): A logger instnace with the configuration that was passed in fromthe configuration file
*/

function createLogger (configData) {
  try {
    let loggerFilePath = configData['logFile']
    let logLevel = configData['logLevel']
    let consoleVisibility = String(configData['visibility']['console'])
    let fileVisibility = String(configData['visibility']['file'])
    let exitOnError = Boolean(configData['exitOnError'])
    var logger = new (winston.Logger)({
      levels: logLevel,
      transports: [
        new (winston.transports.Console)({
          level: consoleVisibility,
          timestamp: function () {
            return new Date()
          },
          formatter: function (options) {
            // Return string will be passed to logger.
            return options.timestamp() + ' ' + options.level.toUpperCase() + ' ' + (options.message ? options.message : '') +
              (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '')
          }
        }),
        new (winston.transports.File)({
          filename: loggerFilePath,
          level: fileVisibility,
          timestamp: function () {
            return Date.now()
          },
          formatter: function (options) {
            // Return string will be passed to logger.
            return options.timestamp() + ' ' + options.level.toUpperCase() + ' ' + (options.message ? options.message : '') +
              (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '')
          }
        })
      ],
      exitOnError: exitOnError
    })
  } catch (err) {
    console.error('Failed to instantiate logger. Details:\n\t' + err.message)
    throw new InitializationError('Failed to initialize the logger. Details:\n\t' + err.message)
  }
  return logger
}

/*
*
* Description:
*   This function checks a passed in config object for the expected RedisMQ configurations.
* Args:
*   configObj (Object): JSON object passed in from the redisMQ module.
* Returns:
*   configObj (Object): JSON object that has been checked for correct keys.
* TODO:
*   [#1]:
*     Need to add recursion for complete sanatation of possible null values in config file.
*/
function validateRedisMQConfig (configObj) {
  // TODO:[1#]
  // Checks to see if 'microservice.metadata', 'broker', 'publishers', and 'subscribers' are in the top level of the json object
  if (!('microservice.metadata' in configObj && 'broker' in configObj && 'publishers' in configObj && 'subscribers' in configObj)) {
    throw new InitializationError('----ERROR: Configfile is missing one or many of the primary configurations. The primary configurations are: \'microservice.metadata\',\'broker\',\'publishers\',\'consumers\'.')
  }
  // Checks to see if 'service.id' and 'component.id' are in the microservice metadata section
  const microserviceMetadata = configObj['microservice.metadata']
  if (!('service.id' in microserviceMetadata && 'component.id' in microserviceMetadata)) {
    throw new InitializationError('----ERROR: Microservice metadata section of the config file is missing one or many of the microservice metadata sections. The sections are \'service.id\' and \'component.id\'.')
  }
// Checks to see if 'host', 'port', 'retry.time', and 'retry.attempts' are in the broker section
  const broker = configObj['broker']
  if (!('host' in broker && 'port' in broker && 'retry.interval' in broker && 'retry.attempts' in broker)) {
    throw new InitializationError('----ERROR: Broker section of the config file is missing one or many of broker configurations. The broker configurations are: \'host\', \'port\', \'retry.time\', \'retry.attempts\'.')
  }
  // Checks to see if 'queue' and 'ack' are in each individual publisher's configuration in the publishers section.
  const publishers = configObj['publishers']
  for (var proKey in publishers) {
    if (!('queue' in publishers[proKey] && 'ack' in publishers[proKey])) {
      throw new InitializationError('----ERROR: The \'' + proKey + '\' section of the publishers section is missing one or many of the required publisher configurations. The publisher configurations are: \'queue\' and \'ack\' .')
    }
  }
  // Checks to see if 'queue', 'ack', and are in each individual consumer's configuration in the consumers section.
  const consumers = configObj['consumers']
  for (var conKey in consumers) {
    if (!('queue' in consumers[conKey] && 'ack' in consumers[conKey])) {
      throw new InitializationError('----ERROR: The \'' + conKey + '\' section of the consumers section is missing one or many of the required consumer configurations. The consumer configurations are: \'queue\' and \'ack\'.')
    }
  }
  // Returns checked config object
  return configObj
}

module.exports = {
  readConfig: readConfig,
  createLogger: createLogger,
  validateRedisMQConfig: validateRedisMQConfig
}
