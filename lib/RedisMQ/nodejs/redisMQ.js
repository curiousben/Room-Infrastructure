/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
'use strict'
const Utils = require('util')
const EventEmitter = require('events')
const async = require('async')
const initialization = require('./lib/initialization.js')
const msgUtils = require('./lib/msgUtils.js')
const baseClient = require('./lib/clients/baseClient.js')
const utilCommands = require('./lib/clients/utilCommands.js')
const publisherMethods = require('./lib/clients/methods/publisherMethods.js')
const subscriberMethods = require('./lib/clients/methods/subscriberMethods.js')
const MalformedMsgError = require('./lib/errors/malformedMsgError.js')
const InitializationError = require('./lib/errors/initializationError.js')
const SubscriberError = require('./lib/errors/subscriberError.js')
const PublisherError = require('./lib/errors/publisherError.js')

/*
* Description:
*   This promise creates a publisher instance that can send messages to a queue directly.
* Args:
*   loggerConfigFilePath (String): The path to the redisMQ configuration file
*   redisMQConfigFilePath (String): The path to the logger configuration file
*   configKey (String): This key is a JSONkey in the config file that houses the metadata for the publisher.
* Returns:
*   Publisher (Promise) An object that has the prototype functions and the client/configs
* Throws:
*   InitializationError (Error) This error will be thrown if any promise fails. All initialization will stop and the error
*   will be propogated to the surface node.js module.
* Notes:
*   This function will always return a Promise make sure to have a thenable to receive the publisher object.
*   All errors will not be caught and handled in the library, they will be exposed to the user to handle any way they choose.
* TODO:
*   Abstract the initialization promises to increase readability and the make the code base more concise.
*/

function Publisher (loggerConfigFilePath, redisMQConfigFilePath, configKey) {

  const loadRedisMQConfig = validRedisMQConfig => {
    return new Promise(
      (resolve, reject) => {
        if (!(validRedisMQConfig['publishers'].hasOwnProperty(configKey))) {
          reject(new InitializationError('Failed to create the ' + this.id + ' publisher. Details:\n\t\'' + this.id + '\' cannot be found in the publishers section.'))
        }
        this.metaDataConfig = validRedisMQConfig['microservice.metadata']
        this.pubConfig = validRedisMQConfig['publishers'][configKey]
        this.id = configKey
        this.logger.info('Base configurations has been loaded', {'publisher': this.id})
        resolve(validRedisMQConfig)
      }
    )
  }

  const createClient = validRedisMQConfig => {
    return new Promise(
      (resolve, reject) => {
        let client = baseClient.create(validRedisMQConfig['broker'], this.logger, this.id)
        client.once('ready', () => {
          this.logger.info('The \'' + this.id + '\' publisher instance has succesfully been created and has connected to the Redis Broker', {'publisher': this.id})
          resolve(client)
        }) 
      }
    )
  }

  this.sendDirect = payload => {
    return Promise.resolve(payload)
    .then(payload => msgUtils.hasOnlyMetadata(payload))
    .then(onlyMetaData => {
      if (onlyMetaData) {
        return utilCommands.luaHashFunctions(this.client, this.luaHashes['findElementInList'], 1, this.metaDataConfig['component.id'] + '.process', payload['address'])
        .then(result => {
          switch (result) {
            case 1:
              return 
            case null:
              throw new PublisherError('The process queue does not exist or is not a Redis list')
            case -1:
              throw new PublisherError('The message does not exist in the process queue')
            case 0:
              throw new PublisherError('The message does not exist in the process queue')
          } 
        })
        .then(() => msgUtils.flatten('', payload))
        .then(flatMsg => publisherMethods.sendExistingDirect(this.client, this.metaDataConfig['component.id'] + '.process', this.pubConfig['queue'], payload['address'], flatMsg))
        .catch(error => {
          throw error
        })
      } else {
        return new Promise(
          (resolve, reject) => {
            resolve(msgUtils.hasPartialMetadata(payload))
          }
        )
        .then(partial => {
          if (partial) {
            throw new PublisherError('The message has malformed metadata. Messages must have \'body\' and \'address\' in the message.')
          } else {
            return msgUtils.createRedisMQMsg(payload)
          }
        })
        .then(newMsg => msgUtils.flatten('', newMsg))
        .then(flatNewMsg => publisherMethods.sendNewMsg(this.client, this.pubConfig['queue'], flatNewMsg['address'], flatNewMsg))
        .catch(error => {
          throw error
        })
      }
    })
    .catch(error => {
      this.logger.error('Failed to send the message. Details:\n\t' + error.message)
      throw error
    })
  }

  // Initialization Promise
  this.logger = null
  return Promise.resolve()
    .then(() => initialization.readConfig(loggerConfigFilePath))
    .then(loggerConfig => initialization.validateLoggerConfig(loggerConfig))
    .then(validLoggerConfig => initialization.createLogger(validLoggerConfig))
    .then(logger => {
      this.logger = logger
      this.logger.info('Logger for the \'' + configKey + '\' publisher has been configured')
    })
    .then(() => initialization.readConfig(redisMQConfigFilePath))
    .then(redisMQConfig => initialization.validateRedisMQConfig(redisMQConfig))
    .then(validRedisMQConfig => loadRedisMQConfig(validRedisMQConfig))
    .then(validRedisMQConfig => createClient(validRedisMQConfig, this.logger, this.id))
    .then(client => {
      this.client = client
      this.client.on('error', err => {
        this.logger.error('Error in the Publisher was encountered:\n\t' + error.message)
      })
      this.client.on('ready', () => {
        this.logger.info('Publisher has been reconnected to the Redis server and all pending commands have been executed')
      })
    })
    .then(() => initialization.parseLuaScripts('./luaScripts/'))
    .then(fileData => initialization.loadLuaScripts(this.client, fileData))
    .then(luaPromises => Promise.all(luaPromises))
    .then(hashes => {
      this.luaHashes = hashes.reduce((previousObj, currentObj) => {
        return Object.assign(previousObj, currentObj)
      }, {})
    })
    .then(() => {
      this.logger.info('The \'' + this.id + '\' publisher is ready to use ... ', {'publisher': this.id})
      return this
    })
    .catch(error => {
      if (this.logger === null) {
        console.error('----ERROR: Failed to initialize the RedisMQ \'' + configKey + '\' publisher. Details:\n\t' + error.message)
      } else {
        this.logger.error('Failed to initialize the RedisMQ \'' + configKey + '\' publisher. Details:\n\t' + error.message)
      }
      throw error
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

function Subscriber (loggerConfigFilePath, redisMQConfigFilePath, configKey) {
  EventEmitter.call(this)

  const loadRedisMQConfig = validRedisMQConfig => {
    return new Promise(
      (resolve, reject) => {
        if (!(validRedisMQConfig['subscribers'].hasOwnProperty(configKey))) {
          let errorDesc = 'Failed to create the ' + this.id + ' subscriber. Details:\n\t\'' + this.id + '\' cannot be found in the subscribers section.'
          this.logger.error(errorDesc)
          reject(new InitializationError(errorDesc))
        }
        this.metaDataConfig = validRedisMQConfig['microservice.metadata']
        this.subConfig = validRedisMQConfig['subscribers'][configKey]
        this.id = configKey
        this.logger.info('Base configurations has been loaded', {'subscriber': this.id})
        resolve(validRedisMQConfig)
      }
    )
  }

  const createClient = validRedisMQConfig => {
    return new Promise(
      (resolve, reject) => {
        let client = baseClient.create(validRedisMQConfig['broker'], this.logger, this.id)
        client.once('ready', () => {
          this.logger.info('The \'' + this.id + '\' subscriber instance has succesfully been created and has connected to the Redis Broker', {'subscriber': this.id})
          resolve(client)
        }) 
      }
    )
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
*
  * There are a few steps that need to happen synchronous order to setup the listener for the subscriber:
  * 1.) Check to see if there is already a listener that is already listening for this subscriber.
  * 2.) Read but not consume messages that might be already in the message queue (This recovers any messages that are stuck in the process queue):
  *   a.) Get the length of the process queue to grab all messages in the process queue
  *   b.) Read messages from oldest to newest and emit an 'MessageReady' event
  * 3.) Start listening for incoming messages on the subscibers queue
*/

  this.startConsuming = () => {
    let processingQueue = this.metaDataConfig['component.id'] + '.process'
    return Promise.resolve()
      // Promise that handle initialization checks for the subscriber's listener
      .then(() => {
        if (this.numberOfSubs > 0) {
          throw new InitializationError('Another subscriber is already listening. Can\'t have more than one listener')
        } else {
          this.numberOfSubs = 1
          return
        }
      })
      // Promise that handles the getting the Promise length
      .then(() => subscriberMethods.getProcessLength(this.client, processingQueue))
      .then(length => {
        if (length > 0) {
          return length - 1
        } else {
          return 0
        }
      })
      // Promise that retrieves all remaining messages in the process queue if there are message present
      .then(processQueueLen => {
        if (processQueueLen === 0) {
          this.logger.info('The processing queue: ' + processingQueue + ' is empty.', {'subscriber': this.id})
          return
        } else {
          this.logger.info('Starting to iterate ' + processingQueue + ' ... ', {'subscriber': this.id})
          let processPromises = []
          while (processQueueLen >= 0) {
            processPromises.push(subscriberMethods.getProcessElements(this.client, processingQueue, processQueueLen))
            processQueueLen--
          }
          // Emits event with message as the payload
          return processPromises.reduce((promiseChain, currentTask) => {
            return promiseChain.then(chainResults => currentTask)
              .then(resultObj => {
                let inflatedObj = msgUtils.inflate({}, resultObj)
                this.emit('MessageReady', inflatedObj)
              })
          }, Promise.resolve())
               .then(() => this.logger.info(' ... Finished iterating through the \'' + processingQueue + '\' queue.', {'subscriber': this.id}))
               .catch(error => {
                 throw error
               })
        }
      })
      .then(() => {
        this.logger.info('The \'' + this.id + '\' subscriber instance has started to listen for messages on the queue \'' + this.subConfig['queue'] + '\'...', {'subscriber': this.id})
        // Promise that handles the initialization of the subscriber's listener
        return new Promise(
          (resolve, reject) => {
            setInterval(() => {
              if (this.isListening === false) {
                this.isListening = true
                subscriberMethods.receiveMsg(this.client, this.subConfig['queue'], processingQueue)
                  .then(resultObj => msgUtils.inflate({}, resultObj))
                  .then(inflatedObj => {
                    //throw new Error('TEST ERROR')
                    this.emit('MessageReady', inflatedObj)
                    this.isListening = false
                  })
                  .catch(error => {
                    this.emit('Error', new SubscriberError('Failed to consume message from the queue \'' + this.subConfig['queue'] + ' \'. Details:\n\t' + error.message + '.'))
                    this.isListening = false
                  })
              }
            }, 5) // 5 milliseconds inbetween method calls
          }
        )
        .catch(error => {
          this.logger.error('Failed to listen to the \'' + this.subConfig['queue'] + '\' queue. Details:\n\t' + error.message)
          throw error
        })
      })
      .catch(error => {
        this.logger.error('Failed to start the consumer. Details:\n\t' + error.message)
        throw error
      })
    }

  // Initialization Promise
  this.logger = null
  return Promise.resolve()
    .then(() => initialization.readConfig(loggerConfigFilePath))
    .then(loggerConfig => initialization.validateLoggerConfig(loggerConfig))
    .then(validLoggerConfig => initialization.createLogger(validLoggerConfig))
    .then(logger => {
      this.logger = logger
      this.logger.info('Logger for the \'' + configKey + '\' subscriber has been configured')
    })
    .then(() => initialization.readConfig(redisMQConfigFilePath))
    .then(redisMQConfig => initialization.validateRedisMQConfig(redisMQConfig))
    .then(validRedisMQConfig => loadRedisMQConfig(validRedisMQConfig))
    .then(validRedisMQConfig => createClient(validRedisMQConfig, this.logger, this.id))
    .then(client => {
      this.client = client
      this.numberOfSubs = 0
      this.isListening = false
      this.client.on('error', err => {
        this.logger.error('Error in the subscriber was encountered:\n\t' + error.message)
      })
      this.client.on('ready', () => {
        this.logger.info('Subscriber has been reconnected to the Redis server and all pending commands have been executed')
      })
    })
    .then(() => initialization.parseLuaScripts('./luaScripts/'))
    .then(fileData => initialization.loadLuaScripts(this.client, fileData))
    .then(luaPromises => Promise.all(luaPromises))
    .then(hashes => {
      this.customFunctions = hashes.reduce((previousObj, currentObj) => {
        return Object.assign(previousObj, currentObj)
      }, {})
    })
    .then(() => {
      this.logger.info('The \'' + this.id + '\' subscriber is ready to use ... ', {'subscriber': this.id})
      return this
    })
    .catch(error => {
      if (this.logger === null) {
        console.error('----ERROR: Failed to initialize the RedisMQ \'' + configKey + '\' subscriber. Details:\n\t' + error.message)
      } else {
        this.logger.error('Failed to initialize the RedisMQ \'' + configKey + '\' subscriber. Details:\n\t' + error.message)
      }
      throw error
    })
}
Utils.inherits(Subscriber, EventEmitter)

// Exports the create methods 
exports.createPublisher = (loggerConfigFilePath, redisMQConfigFilePath, configKey) => {
  return new Publisher(String(loggerConfigFilePath), String(redisMQConfigFilePath), String(configKey))
}
exports.createSubscriber = (loggerConfigFilePath, redisMQConfigFilePath, configKey) => { 
  return new Subscriber(String(loggerConfigFilePath), String(redisMQConfigFilePath), String(configKey))
}
