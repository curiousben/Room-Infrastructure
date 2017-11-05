/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict'

const Utils = require('util')
const EventEmitter = require('events')
const initialization = require('./lib/initialization.js')
const msgUtils = require('./lib/msgUtils.js')
const baseClient = require('./lib/clients/baseClient.js')
const utilCommands = require('./lib/clients/utilCommands.js')
const publisherMethods = require('./lib/clients/methods/publisherMethods.js')
const subscriberMethods = require('./lib/clients/methods/subscriberMethods.js')
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
*   Publisher (Promise) An promise that resolves with the results of a successfull publish of a message.
* Throws:
*   InitializationError (Error) This error will be thrown if any promise fails. All initialization will stop and the error
*     will be propogated to the surface node.js module.
* Notes:
*   This function will always return a Promise make sure to have a thenable to receive the publisher object.
*     All errors will not be caught and handled in the library, they will be exposed to the user to handle any way they choose.
* TODO:
*   [#1]:
*     [Resolved] Abstract the initialization promises to increase readability and the make the code base more concise.
*     [Resolution] All functions return a promise.
*/

function Publisher (loggerConfigFilePath, redisMQConfigFilePath, configKey) {

  const loadRedisMQConfig = validRedisMQConfig => {
    return new Promise(
      (resolve, reject) => {
        if (!('publishers' in validRedisMQConfig)) {
          reject(new InitializationError('The \'publishers\' section doesn\'t exist in the redisMQ configuration.'))
        }
        if (!(validRedisMQConfig['publishers'].hasOwnProperty(configKey))) {
          reject(new InitializationError('\'' + this.id + '\' cannot be found in the publishers section.'))
        }
        this.metaDataConfig = validRedisMQConfig['microservice.metadata']
        this.pubConfig = validRedisMQConfig['publishers'][configKey]
        this.id = configKey
        this.logger.info('Base redisMQ configurations for the publisher \'' + this.id + '\' has been loaded', {'publisher': this.id})
        resolve(validRedisMQConfig)
      }
    )
  }
  
  const createClient = validRedisMQConfig => {
    return new Promise(
      resolve => {
        let client = baseClient.create(validRedisMQConfig['broker'], this.logger, this.id)
        client.once('ready', () => {
          this.logger.info('The \'' + this.id + '\' publisher instance has succesfully been created and has connected to the Redis Broker', {'publisher': this.id})
          resolve(client)
        }) 
      }
    )
  }

  this.sendDirect = (metaTag, payload) => {
    return Promise.resolve()
      .then(() => {
        if (payload === null || payload === undefined || payload === '' || (Object.keys(payload).length === 0 && payload.constructor === Object)) {
          throw new PublisherError("The payload is empty please make sure there is proper data being sent.")
        }
        if (metaTag !== null) {
          return msgUtils.hasCompleteMetaTag(metaTag)
            .then(hasCompleteMetaTag => {
              if (hasCompleteMetaTag) {
                return utilCommands.luaHashFunctions(this.client, this.luaHashes['findElementInList'], 1, this.metaDataConfig['component.id'] + '.process', metaTag['address'])
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
                  .then(() => msgUtils.assembleRedisMQMsg(metaTag, payload))
                  .then(redisMQMsg => msgUtils.flatten('', payload))
                  .then(flatMsg => publisherMethods.sendExistingDirect(this.client, this.metaDataConfig['component.id'] + '.process', this.pubConfig['queue'], metaTag['address'], flatMsg))
                  .catch(error => {
                    throw error
                  })
              } else {
                throw new PublisherError('The message metaTag is malformed please check what is being passed in to the send method')
              }
            })
            .catch(error => {
              throw error
            })
        } else {
          return msgUtils.createRedisMQMsg(payload)
            .then(newMsg => msgUtils.flatten('', newMsg))
            .then(flatNewMsg => publisherMethods.sendNewMsg(this.client, this.pubConfig['queue'], flatNewMsg['metaTag.address'], flatNewMsg))
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
      this.logger.info('Logger for the \'' + configKey + '\' publisher has been successfully been created.')
    })
    .then(() => initialization.readConfig(redisMQConfigFilePath))
    .then(redisMQConfig => initialization.validateRedisMQConfig(redisMQConfig))
    .then(validRedisMQConfig => loadRedisMQConfig(validRedisMQConfig))
    .then(validRedisMQConfig => createClient(validRedisMQConfig, this.logger, this.id))
    .then(client => {
      this.client = client
      this.client.on('error', error => {
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
*   This promise creates a subscriber instance that can receive messages from a queue.
* Args:
*   loggerConfigFilePath (String): The path to the redisMQ configuration file.
*   redisMQConfigFilePath (String): The path to the logger configuration file.
*   configKey (String): This key is a JSONkey in the config file that houses the metadata for the subscriber.
* Returns:
*   Subscriber (Promise) An promise that resolves with the results of a successfull publish of a message.
* Throws:
*   InitializationError (Error) This error will be thrown if any promise fails. All initialization will stop and the error
*     will be propogated to the surface node.js module.
*   MessageError (Error) This error is thrown if the sending or receieving of messages fail.
* Notes:
*   This function will always return a Promise make sure to have a thenable to receive the publisher object.
*     All errors will not be caught and handled in the library, they will be exposed to the user to handle any way they choose.
* TODO:
*   [#1]:
*     [Resolved] Abstract the initialization promises to increase readability and the make the code base more concise.
*     [Resolution] All functions return a promise.
*/

function Subscriber (loggerConfigFilePath, redisMQConfigFilePath, configKey) {
  EventEmitter.call(this)

  const loadRedisMQConfig = validRedisMQConfig => {
    return new Promise(
      (resolve, reject) => {
        if (!('subscribers' in validRedisMQConfig)) {
          reject(new InitializationError('The \'subscribers\' section doesn\'t exist in the redisMQ configuration.'))
        }
        if (!(validRedisMQConfig['subscribers'].hasOwnProperty(configKey))) {
          reject(new InitializationError('\'' + configKey + '\' cannot be found in the subscribers section.'))
        }
        this.metaDataConfig = validRedisMQConfig['microservice.metadata']
        this.subConfig = validRedisMQConfig['subscribers'][configKey]
        this.id = configKey
        this.logger.info('Base redisMQ configurations for the subscriber \'' + this.id + '\' has been loaded', {'subscriber': this.id})
        resolve(validRedisMQConfig)
      }
    )
  }

  const createClient = validRedisMQConfig => {
    return new Promise(
      resolve => {
        let client = baseClient.create(validRedisMQConfig['broker'], this.logger, this.id)
        client.once('ready', () => {
          this.logger.info('The \'' + this.id + '\' subscriber instance has succesfully been created and has connected to the Redis Broker', {'subscriber': this.id})
          resolve(client)
        }) 
      }
    )
  }

  const subscriberListener = () => {
    return subscriberMethods.receiveMsg(this.client, this.subConfig['queue'], this.processingQueue)
      .then(resultObj => msgUtils.inflate({}, resultObj))
      .then(inflatedObj => {
        this.emit('MessageReady', inflatedObj['metaTag'], inflatedObj['body'])
      })
      .then(() => subscriberListener())
      .catch(error => {
        this.emit('Error', new SubscriberError('Failed to consume message from the queue \'' + this.subConfig['queue'] + ' \'. Details:\n\t' + error.message + '.'))
      })
  }

  /*
  * Description:
  *   This function starts the process of listening on a particular queue and add the address to the process queue
  * Args:
  *   N/A
  * Returns:
  *   'MessageReady' (Event): This event is emited when a message is moved from the queue to the microservices
  *     process queue and an inflated obj is passed in the event
  * Throws:
  *   InitializationError: (Error Obj): This custom error is raised when the subscriber is already listening to a
  *     queue or any other error is encountered in initialization.
	*   'Error' (Event): If an error is encountered when consuming a message the subscriber will emit an error
	* Notes:
	*   The loop for detecting message is done by setInterval with a boolean gate to not allow the recieveMsg method
	*     to be needlessly called. The reasoning is since Nodejs is async there is a chance that these processes will be
	*     running in the back and create an overhead.
	* TODO:
	*   [#1]:
	*     [Resolved][PotentialBug] Deep dive research on if the logic gate is needed to safely use setInterval for restarting the redis command
	*       BRPOPLPUSH with timeout at zero. If there is no need the speed of consumption will increase.
	*     [Resolution] Used recursuve promise to accomplish n-iterations
	*
	*   [#2]:
	*    [PotentialBug] Recursive chaining of promises could have a memory leak here is a possible fix:
	*     var i = 0;
	*     (function loop () {
	*       if (++i % 100000 === 0) {
	*         return Promise.resolve().then(() => process.nextTick(loop))
	*       }
	*       return Promise.resolve().then(loop);
	*     })()
	*     [Reference]: https://github.com/nodejs/node/issues/6673
	*
  	* There are a few steps that need to happen synchronous order to setup the listener for the subscriber:
  	* 1.) Check to see if there is already a listener that is already listening for this subscriber.
  	* 2.) Read but not consume messages that might be already in the message queue (This recovers any messages that are stuck in the process queue):
  	*   a.) Get the length of the process queue to grab all messages in the process queue
  	*   b.) Read messages from oldest to newest and emit an 'MessageReady' event
  	* 3.) Start listening for incoming messages on the subscibers queue
	*/

  this.startConsuming = () => {
    this.processingQueue = this.metaDataConfig['component.id'] + '.process'
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
      .then(() => subscriberMethods.getProcessLength(this.client, this.processingQueue))
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
          this.logger.info('The processing queue \'' + this.processingQueue + '\' is empty.', {'subscriber': this.id})
          return
        } else {
          this.logger.info('Starting to iterate through the \'' + this.processingQueue + '\' queue ... ', {'subscriber': this.id})
          let processPromises = []
          while (processQueueLen >= 0) {
            processPromises.push(subscriberMethods.getProcessElements(this.client, this.processingQueue, processQueueLen))
            processQueueLen--
          }

          // Emits event with message as the payload
          return processPromises.reduce((promiseChain, currentTask) => {
            return promiseChain.then(() => currentTask)
              .then(resultObj => {
                let inflatedObj = msgUtils.inflate({}, resultObj)
                this.emit('MessageReady', inflatedObj['metaTag'], inflatedObj['body'])
              })
          }, Promise.resolve())
            .then(() => this.logger.info(' ... Finished iterating through the \'' + this.processingQueue + '\' queue.', {'subscriber': this.id}))
            .catch(error => {
              throw error
            })
        }
      })
      .then(() => {
        this.logger.info('The subscriber \'' + this.id + '\' has started to listen for messages on the queue \'' + this.subConfig['queue'] + '\'...', {'subscriber': this.id})
        // Promise that handles the initialization of the subscriber's listener
        // [#2]
        return Promise.resolve()
          .then(() => subscriberListener())
          .catch(error => {
            throw error
          })
      })
      .catch(error => {
        this.logger.error('Failed to start the consumer. Details:\n\t' + error.message)
        throw error
      })
  }

  /*
	* Description:
	*   This function handles the message creation of exception messages and the publishing of the RedisMQ messages to the error queue
	* Args:
	*   error (Error): The error that was thrown when processing the message.
	*   payload (Payload): The actual message that was consumed at the time when the error was thrown 
	* Returns:
  *   'MessageReady' (Event): This event is emited when a message is moved from the queue to the microservices
  *     process queue and an inflated obj is passed in the event
  * Throws:
  *   MessageError (Error): If an error is encountered when executing commands on the redis server
  * Notes:
  *   This function should handle any error that is passed in the parameters and takes the message of that error and push it to the
  *     error.message queue and take the RedisMessage passed in and push it to the error queue.
  *   This function should be able to create new error messages as well as handle payloads that already exist in Redis.
  * TODO:
  *   [#1]:
  *     N/A
  */

  this.errorHandler = (error, metaTag, payload) => {
    return Promise.resolve()
      .then(() => {
        if (payload === null || payload === undefined || payload === '' || (Object.keys(payload).length === 0 && payload.constructor === Object)) {
          throw new PublisherError("The payload is empty please make sure there is proper data being sent.")
        }
        if (metaTag !== null) {
          return msgUtils.hasCompleteMetaTag(metaTag)
            .then(hasCompleteMetaTag => {
              if (hasCompleteMetaTag) {
                return utilCommands.luaHashFunctions(this.client, this.luaHashes['findElementInList'], 1, this.metaDataConfig['component.id'] + '.process', metaTag['address'])
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
                  .then(() => msgUtils.assembleRedisMQMsg(metaTag, payload))
                  .then(redisMQMsg => msgUtils.flatten('', payload))
                  .then(flatMsg => publisherMethods.sendExistingDirect(this.client, this.metaDataConfig['component.id'] + '.process', this.pubConfig['queue'], metaTag['address'], flatMsg))
                  .catch(error => {
                    throw error
                  })
              } else {
                throw new PublisherError('The message metaTag is malformed please check what is being passed in to the send method')
              }
            })
            .catch(error => {
              throw error
            })
        } else {
          return msgUtils.createRedisMQMsg(payload)
            .then(newMsg => msgUtils.flatten('', newMsg))
            .then(flatNewMsg => publisherMethods.sendNewMsg(this.client, this.pubConfig['queue'], flatNewMsg['metaTag.address'], flatNewMsg))
            .catch(error => {
              throw error
            })
        }
      })
      .then(() => msgUtils.errorMessage(this.metaDataConfig, error)) 
      .then(errMsg => msgUtils.createRedisMQMsg(errMsg))
      .then(newMsg => msgUtils.flatten('', newMsg))
      .then(flatNewMsg => {
        publisherMethods.sendNewMsg(this.client, this.metaDataConfig['errorMessage']['queue'], flatNewMsg['metaTag.address'], flatNewMsg)
        this.logger.info('Error Message has been sent to the errorMessage queue \'' + this.metaDataConfig['errorMessage']['queue'] + '\' at the address: \'' + JSON.stringify(flatNewMsg['metaTag.address']) + '\'', {'subscriber': this.id})
      })
      .catch(error => {
        throw error
      })
  }

/*
  * Description:
  *   This function acknowledges that the message has been processed by the microservice.
  * Args:
  *   metaTag (Obj): This object has the metadata that is associated
  * Returns:
  *   'acked' (String): This string is returned if the address has been removed and one key has been deleted(payload hashmap)
  * Throws:
  *   SubscriberError (Error Obj): This custom error is raised if unexpected results were returned from the consumeMsg method
  *     or a redis exception has been raised while acking a message.
  * Notes:
  *   Only a metaTag is needed to acknowledge a message. 
  * TODO:
  *   [#1]:
  */

  this.acknowledge = metaTag => {
    return subscriberMethods.ackMsg(this.client, this.metaDataConfig['component.id'] + '.process', metaTag)
      .then(result => {
        if (result[0] === 1 || result[1] === 1) {
          return "acked" 
        } else {
          throw new SubscriberError("Unexpected results from acknowledging the metaTag")
        }
      })
      .catch(error => {
        throw new SubscriberError('Failed to acknowledge message from the processing queue \'' + this.metaDataConfig['component.id'] + '.process' + ' \'. Details:\n\t' + error.message + '.')
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
      this.logger.info('Logger for the \'' + configKey + '\' subscriber has been successfully been created.')
    })
    .then(() => initialization.readConfig(redisMQConfigFilePath))
    .then(redisMQConfig => initialization.validateRedisMQConfig(redisMQConfig))
    .then(validRedisMQConfig => loadRedisMQConfig(validRedisMQConfig))
    .then(validRedisMQConfig => createClient(validRedisMQConfig, this.logger, this.id))
    .then(client => {
      this.client = client
      this.numberOfSubs = 0
      this.client.on('error', error => {
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
      this.luaHashes = hashes.reduce((previousObj, currentObj) => {
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

let utils = {
  loadJSON: initialization.readConfig
}

// Exports Functions
exports.createPublisher = (loggerConfigFilePath, redisMQConfigFilePath, configKey) => {
  return new Publisher(String(loggerConfigFilePath), String(redisMQConfigFilePath), String(configKey))
}
exports.createSubscriber = (loggerConfigFilePath, redisMQConfigFilePath, configKey) => { 
  return new Subscriber(String(loggerConfigFilePath), String(redisMQConfigFilePath), String(configKey))
}

exports.utils = utils
