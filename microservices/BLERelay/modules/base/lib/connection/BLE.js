'use strict'
/*
 *
 *
 *
 *
*/

// Import libraries
const util = require('util')
const EventEmitter = require('events')
const nobleMod = require('noble')
const noble = util.promisify(nobleMod)

// Private variables
const _logger = Symbol('logger')
const _noble = Symbol('noble')

// Private Methods
const _stateChange = Symbol('stateChange')

class BLE extends EventEmitter {
  constructor (logger) {
    super()
    this[_logger] = logger
    this[_noble] = noble
  }

  async initializeListener () {
    this[_noble].on('scanStart', function () {
      this[_logger].info('... BLE listener service has started scanning.')
    })
    this[_noble].on('scanStop', function () {
      this[_logger].info('... BLE listener service has stopped scanning.')
    })
    this[_noble].on('discover', function (peripheral) {
      this.emit('discover', peripheral)
    })
    this[_noble].on('stateChange', async function (state) {
      await [_stateChange](this[_logger], noble, state)
    })
  }

  async [_stateChange] (logger, BLEConnection, state) {
    switch (state) {
      case 'poweredOn':
        logger.info('BLE listener service is starting ...')
        try {
          await this[_noble].startScanning([], true)
          logger.info('... BLE listener service has started')
        } catch (err) {
          const errorDesc = `An error was thrown while scanning for BLE devices, details ${err}`
          logger.error(errorDesc)
          this.emit('error', err)
        }
        break
      case 'resetting':
        logger.info('BLE listener service resetting ...')
        break
      case 'unsupported':
        logger.error('BLE listener service is unsupported on this device. Shutting down service ...')
        await this[_noble].stopScanning()
        logger.info('... BLE listener service has been shutdown.')
        break
      case 'unathorized':
        logger.error('BLE listener service is unauthorized on this device. Shutting down service ...')
        await this[_noble].stopScanning()
        logger.info('... BLE listener service has been shutdown.')
        break
      case 'unknown':
        logger.error('BLE listener service has encountered an unknown state. Shutting down service ...')
        await this[_noble].stopScanning()
        logger.info('... BLE listener service has been shutdown.')
        break
      case 'powerOff':
        logger.error('BLE listener service is powering off. Shutting down service ...')
        await this[_noble].stopScanning()
        logger.info('... BLE listener service has been shutdown.')
        break
    }
  }
}
module.exports = BLE
