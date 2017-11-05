/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict'

const InitializationError = require('./errors/initializationError.js')
const winston = require('winston')
const fs = require('fs')
const jsonfile = require('jsonfile')
const path = require('path')

/*
* Description:
*   This function reads each file in the luaScripts directory with utf8 encoding and removes all characters
*   in between '--[[' and '--]]' and extra spaces, tabs, and new-line characters
* Args:
*   folderPath (String): Relative path to the luaScripts directory from the lib directory.
* Returns:
*   fileData (Obj): A object that has key value pairs with the key containing the luaScript filename and the
*     value containing the raw luascript in a single string.
* Throws:
*   ENOENT (Error): If the file or directory does not exist.
* Notes:
*   If any error is raised it is should be considered an internal library error that the user shouldn't have to deal with 
* TODO:
*   N/A
*/

let findFiles = folderPath => {
  let fileData = {}
  let files = fs.readdirSync(path.join(__dirname, folderPath))
  files.forEach(fileName => {
    let name = fileName.replace('.lua', '')
    fileData[name] = fs.readFileSync(path.join(__dirname, folderPath) + fileName, 'utf8').replace(/(\s{2,})|[\r\n]/g, ' ').replace(/--\[\[(.*)--\]\]/g,'').trim()
  })
  return fileData
}

let parseLuaScripts = folderPath => {
  return new Promise(
    resolve => {
      resolve(findFiles(folderPath))
    }
  )
}

/*
* Description:
*   Creates promises that will be passed up to the parent module
* Args:
*   client (Publisher/Subscriber): Publisher/Subscriber client that has an active connection to the redis server.
*   fileData (Obj): A object that has key value pairs with the key containing the luaScript filename and the
*     value containing the raw luascript in a single string.
* Returns:
*   promises (Array): An array of promises of loading scripts to the Redis server
* Throws:
*   RedisError (Error): An error that the Redis client encountered.
* Notes:
*   This was designed for n number of lua scripts that may be added in the future.
* TODO:
*   N/A
*/

let luaLoadPromises = (client, fileData) => {
  let promises = []
  for (let script in fileData) {
    promises.push(
      client.scriptAsync('load' , fileData[script])
        // Fat object declaration gets confused with function declaration w/ fat arrows
        .then(res => {
          return {[script]: res}
        })
    )
  }
  return promises
}

let loadLuaScripts = (client, fileData) => {
  return new Promise(
    resolve => {
      resolve(luaLoadPromises(client, fileData))
    }
  )
}

/*
* Description:
*   This function parses the file located at the passed in file location and loads this into a JSON object.
* Args:
*   filePath (String): A string that is a path to a JSON configuration
* Returns:
*   configObj (Obj): A JSON Object of the configuration loaded from the file located at the filePath
* Throws:
*   InitializationError (Error): If the passed in file path is not a string or a valid file path then
*     this error is thrown
* Notes:
*   Its good to note that all file operations are synchorous.
* TODO:
*   [1#]:
*     Determine if the synchronous file operations hinder the library initialzation process.
*/

let readJSON = filePath => {
  // TODO:[1#]
  let realFilePath = null
  let configObj = null
  // Checks to see if the filePath passed in a string
  if (typeof filePath !== 'string') {
    throw new InitializationError('The file path \'' + filePath + '\' that was passed in not a string.')
  }
  // Determines the absolute path to the config file
  if (fs.existsSync(filePath)) {
    realFilePath = filePath
  } else if (fs.existsSync(path.join(__dirname, filePath))) {
    realFilePath = path.join(__dirname, filePath)
  } else {
    throw new InitializationError('The config file doesn\'t exist at the path:\n\t' + filePath)
  }
  // Reads and Loads the configuration file from the absolute filePath
  configObj = jsonfile.readFileSync(realFilePath)
  return configObj
}

let readConfig = filePath => {
  return new Promise(
    resolve => {
      resolve(readJSON(filePath))
    }
  )
}

/*
* Description:
*   This function creates a winston logger and passes back a logger instance.
* Args:
*   filePath (String): An absolute path that has the logger config file.
* Returns:
*   logger (Winston Logger Instance): A logger instnace with the configuration that was passed in fromthe configuration file
* Throws:
*   Error (Error): Generic error that the Winston logger module throws
* Notes:
*   For consistency '----' needs to be added before every log level.
* TODO:
*   [1$]:
*     Add '----' before the log level
*/

let logger = configData => {
  let loggerFilePath = configData['logFile']
  let logLevel = configData['logLevel']
  let consoleVisibility = String(configData['visibility']['console'])
  let fileVisibility = String(configData['visibility']['file'])
  let exitOnError = Boolean(configData['exitOnError'])
  let logger = new (winston.Logger)({
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
  return logger
}

let createLogger = configData => {
  return new Promise(
    resolve => {
      resolve(logger(configData))
    }
  )
}

/*
* Description:
*   This function checks a passed in config object for the expected logger configurations.
* Args:
*   configObj (Object): JSON object with unvalidated redisMQ configurations.
* Returns:
*   configObj (Object): JSON object with validated redisMQ configurations.
* Throws:
*   InitializationError (Error): If the configuration is incomplete then this error is thrown.
* Notes:
*   For complete sanitization checking for null configurations needs to be more sophisticated
*     to catch any type of null.
* TODO:
*   [#1]:
*     Need to add recursion for complete sanatation of possible null values in config file.
*/

let checkLoggerConfig = configObj => {
  // TODO:[1#]
  // Checks to see if 'logFile', 'logLevel', 'visibility', 'exitOnError' are in the top level of the json object
  if (!('logFile' in configObj && 'logLevel' in configObj && 'visibility' in configObj && 'exitOnError' in configObj)){
    throw new InitializationError('Logger configuration file is missing one or more of the following keys: \'logFile\', \'logLevel\', \'visibility\', \'exitOnError\'')
  }
  // Checks to see if 'console' or 'file' are in the visbility section
  const visibility = configObj['visibility']
  if (!('console' in visibility && 'file' in visibility)){
    throw new InitializationError('Logger configuration file is missing \'console\' or \'file\' in the visibility section')
  }
  return configObj
}

let validateLoggerConfig = configObj => {
  return new Promise(
    resolve => {
      resolve(checkLoggerConfig(configObj))
    }
  )
}

/*
* Description:
*   This function checks a passed in config object for the expected RedisMQ configurations.
* Args:
*   configObj (Object): JSON object passed in from the redisMQ module.
* Returns:
*   configObj (Object): JSON object that has been checked for correct keys.
* Throws:
*   InitializationError (Error): If any configuration does not have a key that is expected this error is thrown
* Notes:
*   Needs a more robust way of checking null values and type checking, at least as mush as javascript will allow.
* TODO:
*   [#1]:
*     Need to add recursion for complete sanatation of possible null values in config file.
*/

let checkRedisMQConfig = configObj => {
  // TODO:[1#]
  // Checks to see if 'microservice.metadata', 'broker', 'publishers', and 'subscribers' are in the top level of the json object
  if (!('microservice.metadata' in configObj && 'broker' in configObj)) {
    throw new InitializationError('The redisMQ config file is missing one or many of the manditory configurations. The mandatory configurations are: \'microservice.metadata\' and \'broker\'.')
  }
  // Checks to see if 'publishers' or 'subscribers' or both are in the top level of the json object
  if (!('publishers' in configObj || 'subscribers' in configObj)) {
    throw new InitializationError('The redisMQ config file is missing one or both worker configuration sections. The worker configurations are: \'publishers\' and \'subscribers\'.')
  }
  // Checks to see if 'service.id' and 'component.id' are in the microservice metadata section
  const microserviceMetadata = configObj['microservice.metadata']
  if (!('service.id' in microserviceMetadata && 'component.id' in microserviceMetadata && 'errorPayload' in microserviceMetadata && 'errorMessage' in microserviceMetadata)) {
    throw new InitializationError('Microservice metadata section of the config file is missing one or many of the microservice metadata sections. The sections are \'service.id\', \'component.id\', \'errorPayload\', and \'errorMessage\'.')
  }
  // Check the see if the 'errorPayload' and 'errorMessage' sections have queue and ack.
  const errorPayload = microserviceMetadata['errorPayload']
  if (!('queue' in errorPayload)) {
    throw new InitializationError('The errorPayload section in the microservice.metadata section is missing one or many of the required errorPayload configurations. The errorPayload configurations are: \'queue\'.')
  }
  const errorMessage = microserviceMetadata['errorMessage']
  if (!('queue' in errorMessage)) {
    throw new InitializationError('The errorMessage section in the microservice.metadata section is missing one or many of the required errorMessage configurations. The errorMessage configurations are: \'queue\'.')
  }
  // Checks to see if 'host', 'port', 'retry.time', and 'retry.attempts' are in the broker section
  const broker = configObj['broker']
  if (!('host' in broker && 'port' in broker && 'retry.interval' in broker && 'retry.attempts' in broker)) {
    throw new InitializationError('Broker section of the config file is missing one or many of broker configurations. The broker configurations are: \'host\', \'port\', \'retry.time\', \'retry.attempts\'.')
  }
  // Checks to see if 'queue' and 'ack' are in each individual publisher's configuration in the publishers section.
  if ('publishers' in configObj) {
    const publishers = configObj['publishers']
    for (var proKey in publishers) {
      if (!('queue' in publishers[proKey])) {
        throw new InitializationError('The \'' + proKey + '\' section of the publishers section is missing one or many of the required publisher configurations. The publisher configurations are: \'queue\'.')
      }
    }
  }
  // Checks to see if 'queue', 'type', and are in each individual consumer's configuration in the consumers section.
  if ('subscribers' in configObj) {
    const consumers = configObj['subscribers']
    for (var conKey in consumers) {
      if (!('queue' in consumers[conKey])) {
        throw new InitializationError('The \'' + conKey + '\' section of the consumers section is a required consumer configuration. The minimum consumer configuration has to include: \'queue\' .')
      }
    }
  }
  // Returns checked config object
  return configObj
}

let validateRedisMQConfig = configObj => {
  return new Promise(
    resolve => {
      resolve(checkRedisMQConfig(configObj))
    }
  )
}

// Export Functions
module.exports = {
  parseLuaScripts: parseLuaScripts,
  loadLuaScripts: loadLuaScripts,
  readConfig: readConfig,
  createLogger: createLogger,
  validateLoggerConfig: validateLoggerConfig, 
  validateRedisMQConfig: validateRedisMQConfig
}
