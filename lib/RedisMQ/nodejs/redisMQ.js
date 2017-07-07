/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
'use strict'
const Utils = require('util')
const EventEmitter = require('events')
const async = require('async')
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

/*
* Description:
*   This function creates a publisher instance that can send message to a topic.
* Args:
*   configKey (String): This key is a JSONkey in the config file that houses the metadata for the subscriber.
* Returns:
*   N/A (Exposed method creates and returns a new instance of this)
* Notes:
*   This method has no callback since this is an initialization method and should only be issued once per topic
*   and the number of subscribers per program shouldn't be too numerable
* TODO:
*   N/A
*/
function Publisher (configKey) {
  if (configData === null) {
    let errorDesc = 'RedisMQ client has not loaded its config file'
    logger.error(errorDesc)
    throw new InitializationError('----ERROR: ' + errorDesc)
  }
  if (logger === null) {
    let errorDesc = 'Logger has not been initialized'
    console.error('----ERROR: ' + errorDesc)
    throw new InitializationError('----ERROR: ' + errorDesc)
  } else {
    this.logger = logger
    this.logger.info('Logger for the \'' + configKey + '\' publisher has been configured', {'publisher': configKey})
  }
  if (!(configData['publishers'].hasOwnProperty(configKey))) {
    let errorDesc = 'Failed to load the publisher ' + configKey + '\'s configurations. Details:\n\t\'' + configKey + '\' cannot be found in the publishers section.'
    this.logger.error(errorDesc)
    throw new InitializationError('----ERROR: ' + errorDesc)
  } else {
    this.publisherConfig = configData['publishers'][configKey]
    this.logger.info('Configuration for the \'' + configKey + '\' publisher has been loaded', {'publisher': configKey})
  }

  try {
    this.publisher = baseClient.create(configData['broker'], this.logger, configKey)
    this.logger.info('The \'' + configKey + '\' publisher instance has succesfully been created and has connected to the Redis Broker', {'publisher': configKey})
  } catch (err) {
    let errorDesc = 'Failed to instantiate the publisher. Details:\n\t' + err.message
    this.logger.error(errorDesc)
    throw new InitializationError('----ERROR: ' + errorDesc)
  }
}

Publisher.prototype.sendDirect = function (payload, callback) {
  var self = this
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
              publisherMethods.sendNewMsg(self.publisher, self.publisherConfig['topic'], newMsg['address'], flatNewMsg, function (err, results) {
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

/*
* Description:
*   This function creates a subscriber instance that can listen for messages on a topic.
* Args:
*   configKey (String): This key is a JSONkey in the config file that houses the metadata for the subscriber.
* Returns:
*   N/A (Exposed method creates and returns a new instance of this)
* Notes:
*   This method has no callback since this is an initialization method and should only be issued once per topic
*   and the number of subscribers per program shouldn't be too numerable
* TODO:
*   N/A
*/
function Subscriber (configKey) {
  EventEmitter.call(this)
  if (configData === null) {
    let errorDesc = 'RedisMQ client has not loaded its config file'
    console.error(errorDesc)
    throw new InitializationError('----ERROR: ' + errorDesc)
  }
  if (logger === null) {
    let errorDesc = 'Logger has not been initialized'
    console.error('----ERROR: ' + errorDesc)
    throw new InitializationError('----ERROR: ' + errorDesc)
  } else {
    this.logger = logger
    this.logger.info('Logger for the \'' + configKey + '\' subscriber has been configured', {'subscriber': configKey})
  }
  if (!(configData['subscribers'].hasOwnProperty(configKey))) {
    let errorDesc = 'Failed to load the subscriber ' + configKey + '\'s configurations. Details:\n\t\'' + configKey + '\' cannot be found in the subscribers section.'
    this.logger.error(errorDesc)
    throw new InitializationError('----ERROR: ' + errorDesc)
  } else {
    this.consumerConfig = configData['subscribers'][configKey]
    this.subscriber = configKey
    this.logger.info('Configuration for the \'' + configKey + '\' subscribers has been loaded', {'subscriber': this.subscriber})
  }

  try {
    this.consumerConfig = configData['subscribers'][configKey]
    this.metadata = configData['microservice.metadata']
    this.numberOfSubs = 0
    this.isListening = false // This is used for the logic gate to stop needless BRPOPLPUSH redis commands issed to the client
    this.client = baseClient.create(configData['broker'], this.logger, configKey)
    this.logger.info('The \'' + this.subscriber + '\' subscriber instance has succesfully been created and has connected to the Redis Broker', {'subscriber': this.subscriber})
  } catch (err) {
    let errorDesc = 'Failed to instantiate the consumer. Details:\n\t' + err.message
    this.logger.error(errorDesc)
    throw new InitializationError('----ERROR: ' + errorDesc)
  }
}

/*
* Description:
*   This function starts the process of listening on a particular topic and add the address to the process queue
* Args:
*   N/A
* Returns:
*   consumed.message (Event): This event is emited when a message is moved from the topic to the microservices
*   process queue and an inflated obj is passed in the event
* Throws:
*   InitializationError: (Error Obj): This custom error is raised when the subscriber is already listening to a queue.
* Notes:
*   The loop for detecting message is done by setInterval with a boolean gate to not allow the recieveMsg method
*   to be needlessly called. The reasoning is since Nodejs is async there is a chance that these processes will be
*   running in the back and create and overhead.
* TODO:
*   Deep dive research on if the logic gate is needed to safely use setInterval for restarting the redis command
*   BRPOPLPUSH with timeout at zero.
*/
Subscriber.prototype.startConsuming = function () {
  var self = this
  let processingQueue = self.metadata['component.id'] + '.process'
  async.series([
    function (callback) {
      // Error handling for initialization of subscriber listener
      if (self.numberOfSubs > 0) {
        let errorDesc = 'The \'' + self.subscriber + '\' subscriber is already listening. Can\'t have more than one listener'
        self.logger.error(errorDesc)
        callback(new InitializationError('----ERROR: ' + errorDesc), null)
      } else {
        callback(null, 'OK')
      }
    },
    function (callback) {
      let processQueueLen = 0
      async.series([
        function (callback) {
          consumerMethods.getProcessLength(self.client, processingQueue, function (err, length) {
            if (err) {
              let errorDesc = 'Failed to get length of the process queue \'' + processingQueue + '\'. Details: \n\t' + err
              self.logger.error(errorDesc, {'subscriber': this.subscriber})
              callback(err, null)
            } else {
              if (length > 0) {
                processQueueLen = length - 1
              }
              callback(null, 'OK')
            }
          })
        },
        function (callbackOne) {
          self.logger.info('Starting to iterate ' + processingQueue + ' ...', {'subscriber': self.subscriber})
          async.whilst(
            function () {
              return processQueueLen !== 0
            },
            function (callback) {
              consumerMethods.getProcessElements(self.client, processingQueue, processQueueLen, function (err, resultObj) {
                if (err) {
                  let errorDesc = 'Failed to consume message from the processing queue\'' + processingQueue + '\'. Details:\n\t' + err
                  self.logger.error(errorDesc, {'subscriber': self.subscriber})
                  callback(err, null)
                } else {
                  msgUtils.inflate({}, resultObj, function (inflatedObj) {
                    self.emit('MessageReady', inflatedObj)
                    processQueueLen--
                    callback(null, 'OK')
                  })
                }
              })
            },
            function (err, result) {
              if (err) {
                let errorDesc = 'Failed iterate through ' + processingQueue + '. Details:\n\t:' + err
                self.logger.error(errorDesc, {'subscriber': self.subscriber})
                callback(err, null)
              } else {
                self.logger.info(' ... Finished iterating through ' + processingQueue, {'subscriber': self.subscriber})
                callback(null, 'OK')
              }
            }
          )
        }
      ])
    }
  ],
  function (err, results) {
    if (err) {
      throw err
    } else {
      // Main listener that listens on the main queue for the consumer
      self.logger.info('The \'' + self.subscriber + '\' subscriber instance has started to listen on the topic \'' + self.consumerConfig['topic'] + '\'...', {'subscriber': self.subscriber})
      setInterval(function () {
        if (self.isListening === false) {
          self.isListening = true
          consumerMethods.receiveMsg(self.client, self.consumerConfig['topic'], processingQueue, function (err, resultObj) {
            if (err) {
              let errorDesc = 'Failed to consume message from the queue\'' + self.consumerConfig['topic'] + '\'. Details:\n\t' + err
              self.logger.error(errorDesc)
              self.emit('Error', err)
            } else {
              msgUtils.inflate({}, resultObj, function (inflatedObj) {
                self.emit('MessageReady', inflatedObj)
                self.isListening = false
              })
            }
          })
        }
      }, 5) // 5 milliseconds inbetween method calls
    }
  })
}
Utils.inherits(Subscriber, EventEmitter)

exports.createPublisher = function (configKey) {
  return new Publisher(String(configKey))
}
exports.createSubscriber = function (configKey) {
  return new Subscriber(String(configKey))
}
exports.init = function (redisMQConfig, loggerConfig) {
  init(redisMQConfig, loggerConfig)
}
