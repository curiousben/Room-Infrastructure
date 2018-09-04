'use strict'

/*
*
*
*
*
*/

// Imported libraries
const EventEmitter = require('events')
const BLEConnection = require('./lib/connection/BLE.js')
const BLEMessageBuilder = require('./lib/utilities/BLEMessageBuilder.js')
const BLEConfig = require('./lib/config/BLEConfig.js')

// 'Private' variables
const _logger = Symbol('logger')
const _BLEConfig = Symbol('BLEConfig')
const _BLEMessageBuilder = Symbol('BLEMessageBuilder')
const _BLEConnection = Symbol('BLEConnection')

class BLEConnector extends EventEmitter {
  constructor (logger, configObj) {
    super()

    // Establishing the logger
    this[_logger] = logger

    // Create the configuration Object
    this[_BLEConfig] = new BLEConfig(logger, configObj)

    // Create the configuration Object
    this[_BLEMessageBuilder] = new BLEMessageBuilder(logger)

    // Create the BLE Connection Object
    this[_BLEConnection] = new BLEConnection(logger)
  }

  async initializeBLEConnector () {
    // Initialize Configuration Object and get the NodeName
    await this[_BLEConfig].loadConfigurations()
    const nodeName = this[_BLEConfig].nodeName

    // Event handler for discovery for the BLE Connection
    this[_BLEConnection].on('discover', async function (peripheral) {
      if (peripheral.advertisement.manufacturerData !== undefined) {
        const msg = await this[_BLEMessageBuilder].createPayload(peripheral, nodeName)
        this.emit('DeviceDiscovery', msg)
      }
    })

    // Event handler for error events for the BLE Connection
    this[_BLEConnection].on('error', function (error) {
      const errorDesc = `An BLEConnector error has been encountered, details ${error.message}`
      this[_logger].error(errorDesc)
      this.emit('Error', error)
    })

    // Start the BLE Connection
    await this[_BLEConnection].initializeListener()
  }
}

module.exports = BLEConnector
