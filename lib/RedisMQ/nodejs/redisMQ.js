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
const subscriberMethods = require('./lib/clients/methods/subscriberMethods.js')
const MalformedMsgError = require('./lib/errors/malformedMsgError.js')
const InitializationError = require('./lib/errors/initializationError.js')
const SubscriberError = require('./lib/errors/subscriberError.js')
const PublisherError = require('./lib/errors/publisherError.js')

/*
* Description:
*   This function creates a publisher instance that can send messages to a queue.
* Args:
*   loggerConfigFilePath (String): The path to the redisMQ configuration file
*   redisMQConfigFilePath (String): The path to the logger configuration file
*   configKey (String): This key is a JSONkey in the config file that houses the metadata for the publisher.
* Returns:
*   N/A (Exposed method creates and returns a new instance of this)
* Notes:
*   This method has no callback since this is an initialization method and should only be issued once per queue
*   and the number of subscribers per program shouldn't be too numerable
* TODO:
*   Improve the promise error catching and handling that is lean and language compliant. The try-catch block is
*   redundent as the Promise automatically wraps the thrown error with a reject. The need to have a catch block
*   is to log the error while propagating the error down the Promise chain to error the chain out.
*/
function Publisher (loggerConfigFilePath, redisMQConfigFilePath, configKey) {
  const createLogger = new Promise(
    (resolve, reject) => {
      if (loggerConfigFilePath == null) {
        const error = new InitializationError('Logger file path has not been passed in.')
        reject(error)
      } else {
        try {
          this.logger = initialization.createLogger(initialization.readJSON(loggerConfigFilePath))
          this.logger.info('Logger for the \'' + configKey + '\' publisher has been configured')
          resolve('OK')
        } catch (error) {
          const errorDesc = '----ERROR: Failed to initialize the logger for the \'' + configKey + '\'. Details:\n\t' + error.message
          console.error(errorDesc)
          reject(new InitializationError(errorDesc))
        }
      }
    }
  ).catch(error => error)
  
  const loadRedisMQConfig = new Promise(
    (resolve, reject) => {
      if (redisMQConfigFilePath == null) {
        const error = new InitializationError('----ERROR: RedisMQ config file path has not been passed in.')
        reject(error)
      } else {
        try {
          this.config = initialization.validateRedisMQConfig(initialization.readJSON(redisMQConfigFilePath))
          this.logger.info('Publisher configuration for the \'' + configKey + '\' publisher has been successfully read')
          resolve('OK')
        } catch (error) {
          const errorDesc = 'Failed to read the Publisher configuration for the \'' + configKey + '\'. Details:\n\t' + error.message
          this.logger.error(errorDesc)
          reject(new InitializationError(errorDesc))
        }
      }
    }
  ).catch(error => error)
  
  const createRedisMQ = new Promise(
    (resolve, reject) => {
      if (!(this.config['publishers'].hasOwnProperty(configKey))) {
        let errorDesc = 'Failed to load the publisher ' + configKey + '\'s configurations. Details:\n\t\'' + configKey + '\' cannot be found in the publishers section.'
        this.logger.error(errorDesc)
        reject(new InitializationError(errorDesc))
      } else {
        try {
          this.id = configKey
          this.logger.info('Configuration for the \'' + this.id + '\' publisher has been loaded', {'publisher': this.id})
          this.client = baseClient.create(this.config['broker'], this.logger, this.id)
          this.logger.info('The \'' + this.id + '\' publisher instance has succesfully been created and has connected to the Redis Broker', {'publisher': this.id})
          resolve('OK')
        } catch (error) {
          const errorDesc = 'Failed to instantiate the publisher. Details:\n\t' + error.message + '.'
          this.logger.error(errorDesc)
          reject(new InitializationError(errorDesc))
        }
      }
    }
  ).catch(error => error)

  const loadLuaScripts = new Promise(
    (resolve, reject) => {
      try {
        this.client.scriptAsync('load', 'return 0').then(res => console.log(res))
      } catch (error) {
        const errorDesc = 'Failed to load custom support Redis methods. Details:\n\t' + error.message
        this.logger.error(errorDesc)
        reject(new InitializationError(errorDesc))
      }
    }
  ).catch(error => error)

  let tasks = [createLogger, loadRedisMQConfig, createRedisMQ, loadLuaScripts]
  tasks.reduce((chain, task) => {
    return chain.then(task)
  }, Promise.resolve())
}

Publisher.prototype.sendDirect = function (payload, callback) {
  let processingQueue = this.metadata['component.id'] + '.process'
}

Publisher.prototype.sendDirect = function (payload, callback) {
  var self = this
  let processingQueue = self.metadata['component.id'] + '.process'

  msgUtils.hasOnlyMetadata(payload, function (onlyMetaData) {
    if (onlyMetaData) {
      msgUtils.flatten('', payload, function (flatMsg) {
        publisherMethods.sendExistingMsg(self.publisherClient, processingQueue, self.publisherConfig['queue'], payload['address'], flatMsg, function (err, results) {
          if (err) {
            let errorDesc = 'Failed to publish message. Details:\n\t' + err.message + '.'
            self.logger.error(errorDesc)
            callback(new PublisherError(errorDesc), null)
          } else {
            callback(null, results)
          }
        })
      })
    } else {
      msgUtils.hasPartialMetadata(payload, function (partial) {
        if (partial) {
          let errorDesc = 'The message that is being sent \'' + String(payload) + '\' has malformed metadata. Messages must have \'body\' and \'address\' in the message.'
          self.logger.error(errorDesc)
          callback(new MalformedMsgError(errorDesc), null)
        } else {
          msgUtils.createRedisMQMsg(payload, function (newMsg) {
            msgUtils.flatten('', newMsg, function (flatNewMsg) {
              publisherMethods.sendNewMsg(self.publisherClient, self.publisherConfig['queue'], newMsg['address'], flatNewMsg, function (err, results) {
                if (err) {
                  let errorDesc = 'Failed to publish new message. Details:\n\t' + err.message + '.'
                  self.logger.error(errorDesc)
                  callback(new PublisherError(errorDesc), null)
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
*   This function creates a subscriber instance that can listen for messages on a queue.
* Args:
*   configKey (String): This key is a JSONkey in the config file that houses the metadata for the subscriber.
* Returns:
*   N/A (Exposed method creates and returns a new instance of this)
* Notes:
*   This method has no callback since this is an initialization method and should only be issued once per queue
*   and the number of subscribers per program shouldn't be too numerable
* TODO:
*   N/A
*/
function Subscriber (configKey) {
  EventEmitter.call(this)

  // Checks to see if the factory has a loaded config file
  if (configData === null) {
    let errorDesc = 'RedisMQ client has not loaded its config file.'
    console.error(errorDesc)
    throw new InitializationError('----ERROR: ' + errorDesc)
  }

  // Checks to see if the factory has initialized a logger
  if (logger === null) {
    let errorDesc = 'Logger has not been initialized.'
    console.error('----ERROR: ' + errorDesc)
    throw new InitializationError('----ERROR: ' + errorDesc)
  } else {
    this.logger = logger
    this.logger.info('Logger for the \'' + configKey + '\' subscriber has been configured')
  }

  // Checks to see if the RedisMQ client has loaded a config file that has a section for this subscriber
  if (!(configData['subscribers'].hasOwnProperty(configKey))) {
    let errorDesc = 'Failed to load the subscriber ' + configKey + '\'s configurations. Details:\n\t\'' + configKey + '\' cannot be found in the subscribers section.'
    this.logger.error(errorDesc)
    throw new InitializationError(errorDesc)
  } else {
    this.metadata = configData['microservice.metadata']
    this.subscriberConfig = configData['subscribers'][configKey]
    this.subscriber = configKey
    this.logger.info('Configuration for the \'' + this.subscriber + '\' subscribers has been loaded', {'subscriber': this.subscriber})
  }

  // Creates a subscriber client with the configurations specified by the loaded config
  try {
    this.numberOfSubs = 0
    this.isListening = false // This is used for the logic gate to stop needless BRPOPLPUSH redis commands issed to the client
    this.client = baseClient.create(configData['broker'], this.logger, this.subscriber)
    this.logger.info('The \'' + this.subscriber + '\' subscriber instance has succesfully been created and has connected to the Redis Broker', {'subscriber': this.subscriber})
  } catch (err) {
    let errorDesc = 'Failed to instantiate the subscriber. Details:\n\t' + err.message + '.'
    this.logger.error(errorDesc, {'subscriber': this.subscriber})
    throw new InitializationError(errorDesc)
  }
}

/*
* Description:
*   This function starts the process of listening on a particular queue and add the address to the process queue
* Args:
*   N/A
* Returns:
*   'MessageReady' (Event): This event is emited when a message is moved from the queue to the microservices
*   process queue and an inflated obj is passed in the event
* Throws:
*   InitializationError: (Error Obj): This custom error is raised when the subscriber is already listening to a
*   queue or any other error is encountered in initialization.
*   'Error' (Event): If an error is encountered when consuming a message the subscriber will emit an error
* Notes:
*   The loop for detecting message is done by setInterval with a boolean gate to not allow the recieveMsg method
*   to be needlessly called. The reasoning is since Nodejs is async there is a chance that these processes will be
*   running in the back and create an overhead.
* TODO:
*   Deep dive research on if the logic gate is needed to safely use setInterval for restarting the redis command
*   BRPOPLPUSH with timeout at zero. If there is no need the speed of consumption will increase.
*/
Subscriber.prototype.startConsuming = function () {
  var self = this
  let processingQueue = self.metadata['component.id'] + '.process'

  /*
  * There are a few steps that need to happen synchronous order to setup the listener for the subscriber:
  * 1.) Check to see if there is already a listener that is already listening for this subscriber.
  * 2.) Read but not consume messages that might be already in the message queue (This recovers any messages that are stuck in the process queue):
  *   a.) Get the length of the process queue to grab all messages in the process queue
  *   b.) Read messages from oldest to newest and emit an 'MessageReady' event
  * 3.) Start listening for incoming messages on the subscibers queue
  */
  async.series([
    // Function to handle initialization checks for the subscriber's listener
    function (listenerCallback) {
      if (self.numberOfSubs > 0) {
        let errorDesc = 'The \'' + self.subscriber + '\' subscriber is already listening. Can\'t have more than one listener'
        self.logger.error(errorDesc, {'subscriber': self.subscriber})
        listenerCallback(new InitializationError(errorDesc), null)
      } else {
        self.numberOfSubs = 1
        listenerCallback(null, 'OK')
      }
    },
    // Function to handle the process queue consumption of messages
    function (processCallback) {
      let processQueueLen = 0
      async.series([
        // Function to handle getting the length of the process queue
        function (processLenCallback) {
          subscriberMethods.getProcessLength(self.client, processingQueue, function (err, length) {
            if (err) {
              let errorDesc = 'Failed to get length of the process queue \'' + processingQueue + '\'. Details: \n\t' + err.message
              processLenCallback(new InitializationError(errorDesc), null)
            } else {
              if (length > 0) {
                processQueueLen = length - 1
              }
              processLenCallback(null, 'OK')
            }
          })
        },
        // Function to handle reading and returning messages that are in the process queue using the length of the queue retrieved from the function above
        function (processConsumeCallback) {
          self.logger.info('Starting to iterate ' + processingQueue + ' ... ', {'subscriber': self.subscriber})
          async.whilst(
            function () {
              return processQueueLen >= 0
            },
            function (whilstCallback) {
              // Function to grab the message and inflate the message
              subscriberMethods.getProcessElements(self.client, processingQueue, processQueueLen, function (err, resultObj) {
                if (err) {
                  let errorDesc = 'Failed to consume message from the processing queue\'' + processingQueue + '\'. Details:\n\t' + err.message
                  whilstCallback(new InitializationError(errorDesc), null)
                } else {
                  msgUtils.inflate({}, resultObj, function (inflatedObj) {
                    self.emit('MessageReady', inflatedObj)
                    processQueueLen--
                    whilstCallback(null, 'OK')
                  })
                }
              })
            },
            // Handler for the whilst function (propagates errors)
            function (err, result) {
              if (err) {
                processConsumeCallback(err, null)
              } else {
                self.logger.info(' ... Finished iterating through the \'' + processingQueue + '\' queue.', {'subscriber': self.subscriber})
                processConsumeCallback(null, 'OK')
              }
            }
          )
        }
      ],
      // Handler for the process function in the async.series (propagates errors)
      function (err, results) {
        if (err) {
          processCallback(err, null)
        } else {
          processCallback(null, results)
        }
      })
    }
  ],
  // Handler for the initialization of the subscriber's listener
  function (err, results) {
    if (err) {
      let errorDesc = 'Failed to initialize the subscriber. Details:\n\t' + err.message + '.'
      self.logger.error(errorDesc, {'subscriber': self.subscriber})
      throw err
    } else {
      // Main listener that listens on the main queue for the subscriber
      self.logger.info('The \'' + self.subscriber + '\' subscriber instance has started to listen for messages on the queue \'' + self.subscriberConfig['queue'] + '\'...', {'subscriber': self.subscriber})
      setInterval(function () {
        if (self.isListening === false) {
          self.isListening = true
          subscriberMethods.receiveMsg(self.client, self.subscriberConfig['queue'], processingQueue, function (err, resultObj) {
            if (err) {
              let errorDesc = 'Failed to consume message from the queue \'' + self.subscriberConfig['queue'] + ' \'. Details:\n\t' + err.message + '.'
              self.logger.error(errorDesc)
              self.emit('Error', new SubscriberError(errorDesc))
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

exports.createPublisher = function (loggerConfigFilePath, redisMQConfigFilePath, configKey) {
  return new Publisher(String(loggerConfigFilePath), String(redisMQConfigFilePath), String(configKey))
}
exports.createSubscriber = function (configKey) {
  return new Subscriber(String(configKey))
}
exports.init = function (redisMQConfig, loggerConfig) {
  init(redisMQConfig, loggerConfig)
}
