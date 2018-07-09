'use strict'

/*
*
*
*
*
*
*
*
*/

// Import modules
const utils = require('util')
const EventEmitter = require('events')
const WemoConnectorError = require('../errors/WemoConnectorError.js')

// Private Variables for the WemoSwitch class
const _logger = Symbol('logger')
const _deviceClient = Symbol('deviceClient')
const _retryLimit = Symbol('retryLimit')
const _retryCount = Symbol('retryCount')
const _timeLastChange = Symbol('timeLastChange')

// Private Methods for the WemoSwitch class
const _getDeviceClient = Symbol('getDeviceClient')
const _loadSwitchConfig = Symbol('loadSwitchConfig')
const _setTimeLastChanged = Symbol('setTimeLastChanged')
const _getbinaryState = Symbol('getbinaryState')

class WemoSwitch extends EventEmitter {

  constructor(logger, wemoConnection, deviceInfo, configObj) {
    // Load the logger for the handler
    this[_logger] = logger

    // Load the switch configuration
    this[_loadSwitchConfig](configObj)

    // Gets the Device Client
    this[_deviceClient] = this[_getDeviceClient](wemoConnection, deviceInfo)
  }

  [_getDeviceClient](wemoConnection, deviceInfo) {
    // Create a wemo client from deviceInfo
    let client = util.promisify(wemoConnection.client(deviceInfo))

    // Set error event handler
    client.on('error', fucntion(err) {
      let errorDesc = `The client encountered an error, details ${err}`
      this[_logger].error(errorDesc)
      this.emit('WemoError', wemoError)
    })

    // Set the change of binary state handler
    client.on('binaryState', function(value) {
      let debugDesc = `The client binary state has changed to ${value}`
      this[_logger].debug(debugDesc)
    });
    return client
  }

  /*
  * Description: This private method sets the Wemo Handler's configuration
  * Args: N/A
  * Returns: N/A
  * Throws: N/A
  */

  [_loadSwitchConfig](configObj) {
    // Loads the retry limit for the switch handler
    this[_retryLimit] = configObj['retryTimes']

    // Sets the retry Count to 0
    this[_retryCount] = 0
  }

  /*
  * Description: This private setter method sets the passed in Date to the last date changed
  * Args: N/A
  * Returns: N/A
  * Throws: N/A
  */

  [_setTimeLastChanged](date) {
    // Sets the last date the switch was changed to the date passed in
    this[_timeLastChange] = date
  }

  /*
  * Description: This private method gets the binary state of the connected device
  * Args: N/A
  * Returns: binaryState - This Integer is the current binary state of the device
  * Throws: N/A
  */

  [_getBinaryState]() {
    // Returns the binary state of the switch
    return this[_deviceClient].getBinaryState()
  }

  /*
  * Description: This method changes the binary state of the switch after
  *   checking to see if the switch needs to be changed.
  * Args: desiredState - This Integer is desired state of the switch
  * Returns: 
  * Throws: N/A
  */

  await set binaryState(desiredState) {
    let currentState = this[_getBinaryState]()
    let needsToChanged = false
    if (desiredState === 1 ) { // Turn on
      if (currentState !== 1) { // Switch is currently off needs to change
        needsToChanged = true 
      }
    } else { // Turn off
      if (currentState !== 0) { // Switch is currenly on needs to change
        needsToChanged = true
      }
    }

    if (needsToChanged) {
      hasNotChanged = true
      while(hasNotChanged) {
        this[_deviceClient].setBinaryState(desiredState)
          .then(response => {
            hasNotChanged = false
            this[_retryCount] = 0
          })
          .throw(err => {
            let errorDesc = `The client encountered an error while trying to change the state to ${desiredState}, details ${err}`
            if (this[_retryLimit] === this[_retryCount]) {
              const wemoError = new WemoConnectorError(errorDesc)
              this.emit('WemoError', wemoError)
              this[_retryCount] = 0
              return
            } else {
              this[_retryCount]++
            }
            this[_logger].error(errorDesc)
          })
        this[_setTimeLastChanged](new Date())
      }
    }
    return
  }

  /*
  * Description: This is a public getter of the last time the binary state changed
  * Args: N/A
  * Returns: N/A
  * Throws: N/A
  */

  get timeLastChange() {
    return this[_setTimeLastChanged]
  }

}
