'use strict'

/*
*
* This Javascript "class" is a handler for a generic Wemo switch.
*   The class allows the library to handle N-number of Wemo
*   in a well defined way. Some exposed methods that is class
*   exposes are changeDeviceState and timeLastChanged
*
*/

// Private Variables for the WemoSwitch class
const _logger = Symbol('logger')
const _retryLimit = Symbol('retryLimit')

class TestModule {
  constructor (logger, wemoConnection, deviceInfo, configObj) {
    // Load the logger for the handler
    this[_logger] = logger

    // Load the switch configuration
    this[_retryLimit] = configObj
  }

  get retryTimes () {
    return this[_retryLimit]
  }

  addFiveTimestoRetry () {
    return this[_retryLimit] + 5
  }
}

module.exports = TestModule
