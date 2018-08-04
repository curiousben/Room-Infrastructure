'use strict'

/*
 *
 *
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
const _getJsClasses = Symbol('getJsClasses')
const _createHandlerHashmap = Symbol('createHandlerHashmap')

class HandlerLoader {
  constructor (logger) {
    try {
      this[_logger] = logger
      const handlerClassNames = await this[_getJavascriptClasses]()
      this[_handlerHashmap] = await this[_createHandlerHashmap](handlerClassNames)
    } catch (error) {
      throw new Error(`Failed to load the device handler loader, details ${error.message}`)
    }
  }

  [_getJavascriptClasses] () {
    return readDir('./handlers')
      .catch(error => {
        throw error
      })
  }

  [_createHandlerHashmap](javascriptClasses){
    return new Promise(
      (resolve) => {
        const handlerHashmap = {}
        javascriptClasses.forEach(javascriptFile=> {
          const className = className.replace(".js", "")
          const handlerModule = require("./handlers/".concat(javascriptFile))
          handlerHashmap[className] = () => {
            return new handlerModule()
          }
        })
      resolve(handlerHashmap)
    })
  }

  getHandler(handlerType, wemoConnection, handlerRetryTimes) {
    if (handlerType in this[_handlerHashmap]) {
      return this[_handlerHashmap][handlerType](handlerType, wemoConnection, handlerRetryTimes)
    } else {
      throw new Error(`The device handler type ${handlerType} does not exist in the handler loader`)
    }
  }
}

module.exports = HandlerLoader
