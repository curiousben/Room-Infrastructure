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
const _intervalPromise = Symbol("intervalPromise")

// Private Methods
const _initDeviceDiscovery = Symbol("initDeviceDiscovery")

class DeviceDiscovery extends EventEmitter {

  constructor(pollingInterval) {
    let pollingIntervalSec = pollingInterval*1000
    this[_intervalPromise] = this[_initDeviceDiscovery](pollingIntervalSec)
  }

  async [_initDeviceDiscovery](pollingIntervalSec) {
    await setIntervalPromise(this[_pollingInterval])
      .then(() => {
        let currentTime = new Date()
        this.emit("DeviceDiscover", currentTime)
      })
      .catch(err => {
        let errorDesc = `Device discovery process failed, details ${err.message}`
        throw new WemoConnectorError(errorDesc)
      })
  }

  startDeviceDiscovery() {
    this[_intervalPromise]()
  }
}
