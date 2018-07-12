'use strict'

/*
 *
 *
 *
 *
*/

// Import modules
const EventEmitter = require("events")
const WemoConnectorError = require('../errors/WemoConnectorError.js')

// Private Fields
const _timeOutObj = Symbol("timeOutObj")
const _pollingIntervalSec = Symbol("pollingIntervalSec")

// Private Methods
const _initDeviceStateRefresher = Symbol("pollingInterval")

class DeviceStateRefresher extends EventEmitter {

  constructor(pollingInterval) {
    this[_pollingIntervalSec]= pollingInterval*1000
    this[_timeOutObj] = this[_initDeviceStateRefresher](this[_pollingIntervalSec])
  }

  async [_initDeviceStateRefresher](pollingIntervalSec) {
    await new Promise(
      (resolve) => {
        this[_timeOutObj] = setTimeout(() => {
          let dateOfSwitchOff = new Date()
          this.emit("SwitchOff", dateOfSwitchOff)
          this.startDeviceStateRefresher()
        }, pollingIntervalSec)
      })
  }

  startDeviceStateRefresher() {
    this[_initDeviceStateRefresher](this[_pollingIntervalSec])
  }
  
  deviceDetected(eventString) {
    clearTimeout(this[_timeOutObj])
    this.startDeviceStateRefresher()
  }
}
