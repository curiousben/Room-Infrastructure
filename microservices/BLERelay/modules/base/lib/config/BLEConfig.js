'use strict'

/*
*
*
*
*
*
*
*/

// 'Private' variables for the Wemo Configuration class
const _logger = Symbol('logger') // Logger Object
const _jsonObj = Symbol('jsonObj') // Object
const _nodeName = Symbol('NodeName') // String

// 'Private' methods for the Wemo Configuration class
const _validateNodeName = Symbol('ValidateHandlerConfig') // Logger Object

class BLEConfig {
  constructor (logger, jsonObj) {
    this[_logger] = logger
    this[_jsonObj] = jsonObj
    this[_logger].debug(`BLE Configuration Object has been instantialized`)
  }

  async loadConfigurations () {
    this[_nodeName] = await this[_validateNodeName](this[_jsonObj])
  }

  [_validateNodeName] (configObj) {
    return new Promise(
      (resolve) => {
        // Checking the surface level key is in the configuration
        if (!('node' in configObj)) {
          const errorDesc = `The 'node' key has not been found in the configuration object`
          throw new Error(errorDesc)
        }
        // Checking to see if the node has a name
        if (!('name' in configObj['node'])) {
          const errorDesc = `The 'name' key has not been found in the 'node' object`
          throw new Error(errorDesc)
        }
        const nodeName = configObj['node']['name']
        resolve(nodeName)
      })
  }

  get nodeName () {
    return this[_nodeName]
  }
}

module.exports = BLEConfig
