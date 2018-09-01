'use strict'

/*
 *
 * This module creates a factory where new handler instances can be created
 *   with no need to pass in configuration from outside of the module.
 *
*/

// Import modules
const util = require('util')
const fs = require('fs')
const readDir = util.promisify(fs.readdir)

// Import private variabes
const _handlerHashmap = Symbol('handlerHashmap')
const _logger = Symbol('logger')

// Import private methods
const _getJavascriptClasses = Symbol('getJavascriptClasses')

class HandlerLoader {
  constructor (logger) {
    this[_logger] = logger
  }

  /*
  * |======== PRIVATE ========|
  *
  * Desc:
  *   This method gathers the names of the JavaScript Class handlers
  * Params:
  *   N/A
  * Throws:
  *   Error - Any execption that might occur while trying to open the handlers directory
  *
  */
  [_getJavascriptClasses] () {
    return readDir(`${__dirname}/handlers`)
      .catch(error => {
        throw error
      })
  }

  /*
  * |======== PUBLIC  ========|
  *
  * Desc:
  *   This method creates a hashmap of loaded handler modules
  * Params:
  *   javascriptClasses(Array) - Classes found in the handler directory
  * Throws:
  *   Error - Any execption that might occur while trying to create the hashmap of handler instances
  *
  */
  async createHandlerLoader () {
    const handlerHashmap = {}
    const javascriptClasses = await this[_getJavascriptClasses]()
    javascriptClasses.forEach(javascriptFile => {
      const className = javascriptFile.replace('.js', '')
      const handlerModule = require('./handlers/'.concat(javascriptFile))
      handlerHashmap[className] = handlerModule
    })
    this[_handlerHashmap] = handlerHashmap
  }

  /*
  * |======== PUBLIC  ========|
  *
  * Desc:
  *   This method gathers the names of the JavaScript Class handlers
  * Params:
  *   handlerType (String) - Type of Wemo Handler
  *   wemoConnection (WemoConnection) - WemoConnection instance
  *   handlerRetryTimes (Integer) - Number of retry attempts for the WemoConnection
  * Throws:
  *   Error - Any execption that might occur while trying to create the hashmap of handler instances
  *
  */
  getHandler (handlerType, logger, deviceInfo, wemoConnection, handlerRetryTimes) {
    if (handlerType in this[_handlerHashmap]) {
      return new this[_handlerHashmap][handlerType](logger, deviceInfo, wemoConnection, handlerRetryTimes)
    } else {
      throw new Error(`The device handler type ${handlerType} does not exist in the handler loader`)
    }
  }
}

module.exports = HandlerLoader
