'use strict'

/*
*
* This Javascript "class" is a handler for a generic Wemo switch. 
*   The class allows the library to handle N-number of Wemo
*   in a well defined way. Some exposed methods that is class
*   exposes are changeDeviceState and timeLastChanged
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
const _getBinaryState = Symbol('getBinaryState')
const _setBinaryState = Symbol('setBinaryState')

class WemoSwitch extends EventEmitter {

  constructor(logger, wemoConnection, deviceInfo, configObj) {
    // Load the logger for the handler
    this[_logger] = logger

    // Load the switch configuration
    this[_loadSwitchConfig](configObj)

    // Gets the Device Client
    this[_deviceClient] = this[_getDeviceClient](wemoConnection, deviceInfo)
  }

  /*
  * |======== PRIVATE ========|
  * Description: This private method gets a promisified client
  *   from the main wemoConnection and the returned deviceInfo
  * Args: wemoConnection - This is the main WemoConnection made
  *         outside of this class
  *       deviceInfo - This is the deviceinfo that has been
  *         discovered by the  main Wemo connection
  * Returns: client - This is a promisified Wemo Client that is
  *           used to interact with the Wemo Device
  * Throws: N/A
  */

  [_getDeviceClient](wemoConnection, deviceInfo) {
    // Create a wemo client from deviceInfo
    let client = wemoConnection.client(deviceInfo)

    // Set error event handler
    client.on('error', fucntion(err) {
      let errorDesc = `The client encountered an error, details ${err}`
      this[_logger].error(errorDesc)
      this.emit('WemoHandlerException', wemoError)
    })

    // Set the change of binary state handler
    client.on('binaryState', function(value) {
      let debugDesc = `The client binary state has changed to ${value}`
      this[_logger].debug(debugDesc)
    });
    return client
  }

  /*
  * |======== PRIVATE ========|
  * Description: This private method sets the Wemo Handler's configuration
  * Args: configObj - This Object is the configuration for the specific handler
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
  * |======== PRIVATE ========|
  * Description: This private setter method sets the passed in Date to the
  *   last date changed for the handler
  * Args: date - This is a Javascript Date object
  * Returns: N/A
  * Throws: N/A
  */

  [_setTimeLastChanged](date) {
    // Sets the last date the switch was changed to the date passed in
    this[_timeLastChange] = date
  }

  /*
  * |======== PRIVATE ========|
  * Description: This private method sets the binary state of the connected device
  * Args: desiredState - This is the integer that the represents the desired state
  *   of the Wemo Deivice. 1 is on and 0 is off.
  * Returns: response - This is the Response from the soap call to the Wemo Device
  * Throws: WemoConnectorError - A custom exception that wraps ANY exception that
  *   is throw while trying to CHANGE the state of the device. This exception is
  *   only thrown when the number of configured retris has been reached.
  */

  async [_setBinaryState](desiredState) {
    let hasNotSetBinaryState = true
    while(hasNotSetBinaryState) { // Keeps trying to change the state of the device
      try {
        let wemoResponse = await this[_deviceClient].setBinaryState(desiredState)) // A successful change of state has been performed update time last changed and 
        hasNotSetBinaryState = false
        this[_retryCount] = 0 // Reset retry count since the device is reachable
        this[_setTimeLastChanged](new Date())
        return wemoResponse
      } catch (error) {
        let errorDesc = `The client encountered an error while trying to change the state to ${desiredState}, details ${error.message}`
        this[_logger].error(errorDesc)
        if (this[_retryLimit] === this[_retryCount]) { // The maximum number of configured retries has been reached
          this[_retryCount] = 0
          throw new WemoConnectorError(errorDesc)
        } else { // The maximum number of configured retries has NOT been reached
          this[_retryCount]++
        }
      }
  }

  /*
  * |======== PRIVATE ========|
  * Description: This private method gets the binary state of the connected device
  * Args: N/A
  * Returns: binaryState - This Integer is the current binary state of the device
  * Throws: WemoConnectorError - A custom exception that wraps ANY exception that
  *   is throw while trying to GET the state of the device. This exception is only
  *   thrown when the number of configured retris has been reached.
  */

  async [_getBinaryState]() {
    // Returns the binary state of the switch
    let hasNotReceivedState = true
    while(hasNotReceivedState) { // Keeps trying to change the state of the device
      try {
        let wemoResponse = await this[_deviceClient].getBinaryState()) // A successful change of state has been performed update time last changed and
        hasReceivedState = false
        this[_retryCount] = 0 // Reset retry count since the device is reachable
        return wemoResponse 
      } catch(error) {
        let errorDesc = `An error has been encountered while trying to get the state of the switch, details ${err.message}`
        this[_logger].error(errorDesc)
        if (this[_retryLimit] === this[_retryCount]) { // The maximum number of configured retries has been reached
          this[_retryCount] = 0
          throw new WemoConnectorError(errorDesc)
        } else { // The maximum number of configured retries has NOT been reached
          this[_retryCount]++
        }
      }
    }
  }

  /*
  * |======== PUBLIC ========|
  * Description: This method changes the binary state of the switch after
  *   checking to see if the switch needs to be changed.
  * Args: desiredState - This String is desired state of the switch
  * Returns: result - The Wemo response to a successful state change
  * Throws: N/A
  */

  async changeDeviceState(desiredState) {
    let result = null
    try {
      let currentState =  await this[_getBinaryState]()
      let needsToChanged = false

      // Determines if the switches states needs to be changed
      if (desiredState === 'On') { // Turn on
        if (currentState !== 'On') { // Switch is currently off needs to change
          needsToChanged = true 
        }
      } else { // Turn off
        if (currentState !== 'Off') { // Switch is currenly on needs to change
          needsToChanged = true
        }
      }

      // Switch needs to be changed sets the new Binary state
      if (needsToChanged) {
        result = await this[_setBinaryState]((desiredState === 'On') ? 1 : 0)
      }
    } catch (err){
      this.emit('WemoHandlerException', err)
    }
    return result
  }

  /*
  * |======== PRIVATE ========|
  * Description: This is a public getter of the last time the binary state changed
  * Args: N/A
  * Returns: date - This is the last time object (Date) that was passed in on a
  *   successful state change for the WemoConnector
  * Throws: N/A
  */

  get timeLastChange() {
    return this[_setTimeLastChanged]
  }

}
