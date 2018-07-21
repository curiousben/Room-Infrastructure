'use strict'

/*
 *
 *
 *
 *
*/

// Importing of Modules
const EventEmitter = require('events')
const util = require("util")
const WemoConnectorError = require('../errors/WemoConnectorError.js')

// Promisifying the setInterval
const setIntervalPromise = util.promisify(setInterval)

// Private Fields
const _logger = Symbol("logger")
const _pollingIntervalSec = Symbol("pollingIntervalSec")

// Private Methods
const _startIntervalTimer = Symbol("startIntervalTimer")

class DeviceScanner extends EventEmitter {

  constructor(logger, pollingInterval) {
    this[_logger] = logger
    this[_pollingIntervalSec] = pollingInterval * 1000
  }

   /*
  * |======== PRIVATE ========|
  *
  */ 
  async [_startIntervalTimer](pollingIntervalSec) {
    await setIntervalPromise(this[_pollingInterval])
      .then(() => {
        let currentTime = new Date()
        this.emit("Discover", currentTime)
        this[_logger].info(`The Device Scanner has fired a scheduled device discover event ${currentTime}`)
      })
      .catch(err => {
        let errorDesc = `Device discovery process failed, details ${err.message}`
        throw new WemoConnectorError(errorDesc)
      })
  }

  /*
  * |======== PUBLIC ========|
  *
  */
  startDeviceScanner() {
    this[_startIntervalTimer]()
    this[_logger].info(`The Device Scanner has started with the interval of ${this[_pollingIntervalSec]}`)
  }
}
