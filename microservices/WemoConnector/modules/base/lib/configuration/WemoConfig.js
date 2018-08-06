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
const _deviceHandlers= Symbol('deviceHandlers') // Array
const _scannerInterval = Symbol('scannerInterval') // Integer
const _refreshInterval = Symbol('refreshInterval') // Integer

// Private Methods for the Wemo Configuration class
const _loadConfiguration = Symbol('loadConfiguration') //Method

class WemoConfig {

  constructor(jsonObj){
    Promise.all([
      this[_validateHandlerConfig](jsonObj),
      this[_validateScannerIntervalConfig](jsonObj),
      this[_validateRefreshIntervalConfig](jsonObj)
    ])
    .then(configs => [_loadConfiguration](configs))
    .catch(err => {
      throw err
    })
  }

  [_loadConfiguration]([deviceHandlers, scannerInterval, refreshInterval]) {
    this[_deviceHandlers] = deviceHandlers
    this[_scannerInterval] = scannerInterval
    this[_refreshInterval] = refreshInterval
  }
  
  async [_validateHandlerConfig](configObj) {
    new Promise(
      (resolve) => {
        const validatedHandlersConfig = {}
        // Checking the surface level keys in the configuration
        if (!('deviceHandlers' in configObj)) {
          let errorDesc = 'The \'deviceHandlers\' key has not been found in the configuration object'
          throw new Error(errorDesc)
        }

        // Checking the configuration in the device handlers
        const handlers = configObj['deviceHandlers']
        handlers.forEach(handler => {
          if (!('friendlyName' in handler) || !('handlerType' in handler) || !('retryTimes' in handler)) {
            let errorDesc = `The handler ${JSON.stringify(handler, null, 2)} does not have 'friendlyName', 'handlerType', or 'retryTimes'`
            throw new Error(errorDesc)
          }
        })
        resolve(validatedHandlersConfig)
    })
  }

  async [_validateScannerIntervalConfig](configObj) {
    new Promise(
      (resolve,reject) => {
        const validatedScannerInterval = null
        // Checking the surface level keys in the configuration
        if (!('scannerIntervalSec' in configObj)){
          let errorDesc = 'The \'scannerIntervalSec\' has not been found in the configuration object'
          reject(new Error(errorDesc))
        }
        resolve(validatedScannerInterval)
    })
    .catch(error => {
      throw error
    })
  }

  async [_validateRefreshIntervalConfig](configObj) {
    new Promise(
      (resolve) => {
        const validatedRefreshInterval = null
        // Checking the surface level keys in the configuration
        if (!('refreshIntervalSec' in configObj)){
          let errorDesc = 'The \'refreshIntervalSec\' has not been found in the configuration object'
          throw new Error(errorDesc)
        }
        resolve(validatedRefreshInterval)
    })
  }

  get handlerCount() {
    return this[_deviceHandlers].length
  }

  getFindHandlerConfig(fname) {
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
