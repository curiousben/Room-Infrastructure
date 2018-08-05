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
const _logger = Symbol("logger")

// Private Methods
const _startTimeoutTimer= Symbol("startTimeoutTimer")

class StateRefresher extends EventEmitter {

  constructor(logger, pollingInterval) {
    super()
    this[_logger] = logger
    this[_pollingIntervalSec] = pollingInterval*1000
    logger.info(`Polling Interval is ${this[_pollingIntervalSec]} seconds`)
  }

  async [_startTimeoutTimer](pollingIntervalSec) {
   new Promise(
      (resolve) => {
        this[_timeOutObj] = setTimeout(() => {
          const dateOfSwitchOff = new Date()
          this.emit("SwitchOff", dateOfSwitchOff)
          this[_logger].info(`State Refresher timer has expired at the time ${dateOfSwitchOff}, now restarting the countdown`)
          this.startStateRefresher()
        }, this[_pollingIntervalSec])
        resolve()
      })
  }

  startStateRefresher() {
    this[_logger].info(`State Refresher has been started with the interval of ${this[_pollingIntervalSec]}`)
    this[_startTimeoutTimer](this[_pollingIntervalSec])
      .catch(error => {
        throw error
      })
  }
  
  delayRefresh(eventString) {
    clearTimeout(this[_timeOutObj])
    this[_logger].info(`State Refresher has been delayed by the event string of ${eventString}`)
    this.startStateRefresher(this[_pollingIntervalSec])
  }

  stopStateRefresher() {
    clearTimeout(this[_timeOutObj])
    this[_logger].info('State Refresher has been stopped') 
  }
}

module.exports = StateRefresher
