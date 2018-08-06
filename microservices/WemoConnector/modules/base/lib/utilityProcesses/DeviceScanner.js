'use strict'

/*
 *
 *
 *
 *
*/

// Importing of Modules
const EventEmitter = require('events')

// Private Fields
const _logger = Symbol("logger")
const _pollingIntervalSec = Symbol("pollingIntervalSec")
const _timeIntervalObj = Symbol("timeIntervalObj")

// Private Methods
const _startIntervalTimer = Symbol("startIntervalTimer")

class DeviceScanner extends EventEmitter {

  constructor(logger, pollingInterval) {
    super()
    this[_logger] = logger
    this[_pollingIntervalSec] = pollingInterval * 1000
  }

   /*
  * |======== PRIVATE ========|
  *
  */ 
  async [_startIntervalTimer](pollingIntervalSec) {
    new Promise(
      (resolve) => {
        this[_timeIntervalObj] = setInterval(() => {
          const dateOfDiscovery = new Date()
          this.emit("Discover", dateOfDiscovery)
          this[_logger].info(`The Device Scanner has fired a scheduled device discover event ${dateOfDiscovery}`)
        }, this[_pollingIntervalSec])
        resolve()
      }
    )
  }

  /*
  * |======== PUBLIC ========|
  *
  */
  startDeviceScanner() {
    this[_startIntervalTimer]()
      .catch(error => {
        throw error
      })
    this[_logger].info(`The Device Scanner has started with the interval of ${this[_pollingIntervalSec]}`)
  }

  /*
  * |======== PUBLIC ========|
  *
  */
  stopDeviceScanner() {
    clearTimeout(this[_timeIntervalObj])
    this[_logger].info('The Device Scanner timer has stopped ...')
  }

}

module.exports = DeviceScanner
