/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
const initialization = require('./lib/initialization.js')
const msgUtils = require('lib/msgUtils.js')
const baseClient = require('./lib/client/baseClient.js')
const producerMethods = require('./lib/client/methods/producerMethods.js')
const consumerMethods = require('./lib/client/methods/consumerMethods.js')
const MalformedMsgError = require('./lib/errors/malformedMsgError.js')
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
    let loggerConfigObj = initialization.readConfig(redisMQConfig)
    configData = initialization.validateRedisMQConfig(redisMQConfigObj)
    logger = initialization.createLogger(loggerConfigObj)
  } catch (err) {
    throw err
  }
}

function Producer (configKey) {	
  if (configData === null) {
    logger.error('RedisMQ client has not loaded its config file');
    process.exit(1);
  }
  if (!(configData['producers'].hasOwnProperty(configKey))) {
    logger.error('The Key: ' + configKey + ' is not in the producers section of the loaded config file');
    process.exit(1);
  }
  try {
    this.producerConfig = configData[configkey]
    this.producer = baseClient.create(configData['broker'])
  } catch (err) {
    console.log('Failed to instantiate the producer. Details:\n\t' + err);
    process.exit(1);
  }
}

Producer.prototype.send = function(payload, callback) {
  if (msgUtils.hasOnlyMetadata(payload)) {
    var flatPayload = msgUtils.flatten('', payload)
    producerMethods.sendExistingMsg(this.producer, this.producerConfig['topic'] ,payload['address'], flatPayload, function(err, results){
      if (err){
        callback(err, null)
      } else {
        callback(null, results)
      }
    })
  } else {
    if (msgUtils.hasPartialMetadata(payload)) {
      throw new MalformedMsgError('----ERROR: \'' + String(payload) + '\' has a malformed metadata.')
    } else {
      let newMsg = msgUtils.createRedisMQMsg(payload), flatPayload = flatten('', newMsg);
      producerMethods.sendNewMsg(this.producer, this.producerConfig['topic'], newMsg['address'], flatPayload, function(err, results){
        if (err) {
          callback(err, null)
        } else {
          callback(null, results)
        }
      });
    }
  }
};

function Consumer(logger, configKey) {
  if (configData === null) {
    logger.error('RedisMQ client hs not loaded its config file');
    process.exit(1);
  }

  if (!(configData.hasOwnProperty(configKey))) {
    logger.error('The Key: ' + configKey + ' is not in the loaded config file');
    process.exit(1);
  }

  try {
  } catch (err) {
    console.log('Failed to instantiate the consumer. Details:\n\t' + err);
    process.exit(1);
  }
}

exports.createProducer = function() {
  return new Producer(logger, configKey);
}; 
exports.createConsumer= function() {
  return new Consumer(logger, configKey);
}; 
module.exports = {
  init: init,
  config: configData,
}
