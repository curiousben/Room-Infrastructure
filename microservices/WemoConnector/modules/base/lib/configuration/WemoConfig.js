'use strict'

/*
*
*
*
*
*
*
*/

// Private Method for the Wemo Configuration class
const _validateHandlerConfig = Symbol('validateHandlerConfig')
const _validateScannerIntervalConfig = Symbol('validateScannerIntervalConfig')
const _validateRefreshIntervalConfig = Symbol('validateRefreshIntervalWemoConfig')

// Private variables for the Wemo Configuration class
const _logger = Symbol('logger') // Logger Object
const _jsonObj = Symbol('jsonObj') // Object
const _deviceHandlers = Symbol('deviceHandlers') // Array
const _scannerInterval = Symbol('scannerInterval') // Integer
const _refreshInterval = Symbol('refreshInterval') // Integer

class WemoConfig {
  constructor (logger, jsonObj) {
    this[_jsonObj] = jsonObj
    this[_logger] = logger
    this[_logger].info(`WemoConfig Object has received the following config ${JSON.stringify(jsonObj, null, 2)}`)
  }

  async loadConfigurations () {
    this[_deviceHandlers] = await this[_validateHandlerConfig](this[_jsonObj])
    this[_scannerInterval] = await this[_validateScannerIntervalConfig](this[_jsonObj])
    this[_refreshInterval] = await this[_validateRefreshIntervalConfig](this[_jsonObj])
  }

  [_validateHandlerConfig] (configObj) {
    return new Promise(
      (resolve) => {
        // Checking the surface level keys in the configuration
        if (!('deviceHandlers' in configObj)) {
          const errorDesc = 'The \'deviceHandlers\' key has not been found in the configuration object'
          throw new Error(errorDesc)
        }

        // Checking the configuration in the device handlers
        const handlers = configObj['deviceHandlers']
        handlers.forEach(handler => {
          if (!('friendlyName' in handler) || !('handlerType' in handler) || !('retryTimes' in handler)) {
            const errorDesc = `The handler ${JSON.stringify(handler, null, 2)} does not have 'friendlyName', 'handlerType', or 'retryTimes'`
            throw new Error(errorDesc)
          }
        })
        resolve(handlers)
      })
  }

  [_validateScannerIntervalConfig] (configObj) {
    return new Promise(
      (resolve) => {
        // Checking the surface level keys in the configuration
        if (!('scannerIntervalSec' in configObj)) {
          const errorDesc = 'The \'scannerIntervalSec\' has not been found in the configuration object'
          throw new Error(errorDesc)
        }
        resolve(configObj['scannerIntervalSec'])
      })
  }

  [_validateRefreshIntervalConfig] (configObj) {
    return new Promise(
      (resolve, reject) => {
        // Checking the surface level keys in the configuration
        if (!('refreshIntervalSec' in configObj)) {
          const errorDesc = 'The \'refreshIntervalSec\' has not been found in the configuration object'
          throw new Error(errorDesc)
        }
        resolve(configObj['refreshIntervalSec'])
      })
  }

  get handlerCount () {
    return this[_deviceHandlers].length
  }

  getFindHandlerConfig (fname) {
    return this[_deviceHandlers].find(function (handler) {
      return handler['friendlyName'] === fname
    })
  }

  get refreshInterval () {
    return this[_refreshInterval]
  }

  get scannerInterval () {
    return this[_scannerInterval]
  }
}

module.exports = WemoConfig
