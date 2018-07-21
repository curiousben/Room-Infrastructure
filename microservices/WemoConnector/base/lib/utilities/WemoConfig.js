'use strict'

/*
*
*
*
*
*
*
*/

// Import error object
const InitializationError = require('../errors/InitializationError.js')

// Private Method for the Wemo Configuration class
const _validateWemoConfig = Symbol('validateWemoConfig')

// Private variables for the Wemo Configuration class
const _deviceHandlers= Symbol('deviceHandlers') // Array
const _scannerInterval = Symbol('scannerInterval') // Integer
const _refreshInterval = Symbol('refreshInterval') // Integer

class WemoConfig {

  constructor(configObj){
    this[_validateWemoConfig](configObj) 
  }

  [_validateWemoConfig](configObj) {

    // Checking the surface level keys in the configuration
    if (!('deviceHandlers' in configObj) || !('scannerInterval' in configObj) || !('refreshInterval' in configObj)){
      let errorDesc = 'The keys \'deviceHandlers\', \'statePollingIntervalSec\', or \'scannerIntervalSec\' have not been found in the configuration object'
      throw new InitializationError(errorDesc)
    }

    // Checking the configuration in the device handlers
    const handlers = configObj['deviceHandlers']
    handlers.forEach(handler => {
      if (!('friendlyName' in handler) || !('handlerType' in handler) || !('retryTimes' in handler)) {
        let errorDesc = `The handler ${JSON.stringify(handler, null, 2)} does not have 'friendlyName', 'handlerType', or 'retryTimes'`
        throw new InitializationError(errorDesc)
      }
    })

    // loading the configurations into the private variables
    this[_deviceHandlers] = handlers
    this[_scannerInterval] = configObj['scannerInterval']
    this[_refreshInterval] = configObj['refreshInterval']
  }

  get handlerCount() {
    return this[_deviceHandlers].length
  }

  get findHandlerConfig(fname) {
    return this[_deviceHandlers].find(function(handler){
      return handler['friendlyName'] === fname
    })
  }

  get refreshInterval() {
    return this[_refreshInterval]
  }

  get scannerInterval() {
    return this[_scannerInterval]
  }
}

module.exports = WemoConfig
