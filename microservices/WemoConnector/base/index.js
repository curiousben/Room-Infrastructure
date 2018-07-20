/*
 *
 *
 *
 *
 *
*/
// Import modules
const util = require('util')
const wemo = require('wemo')
const wemoPromise = util.promisify(wemo)
const DeviceDiscovery = require('./lib/DeviceDiscovery.js')
const DeviceStateRefresh = require('./lib/DeviceStateRefresher.js')

// Import errors
const WemoConnectorError = require('./lib/errors/WemoConnectorError.js')

// Import handlers
const handlerObj = require('./lib/handler/index.js')

// Import utilities
const wemoConfig = require('./lib/WemoConfig.js')

// Private variables
const _logger = Symbol('logger')
const _wemoClient = Symbol('wemoClient')
const _activeConnections = Symbol('activeConnections')
const _deviceStateRefresherObj = Symbol('deviceRefresherObj')
const _deviceDiscoveryObj = Symbol('deviceDiscoveryObj')
const _mode = Symbol('mode')

// Private methods
const _loadWemoConfig = Symbol('loadWemoConfig')
const _loadHandlers = Symbol('loadHandlers')
const _loadStateRefresher = Symbol('loadStateRefresher')
const _loadDeviceDiscovery = Symbol('loadDeviceDiscovery')

class WemoConnector {
  constructor(jsonObj, logger) {
    this[_logger] = logger
    this[_activeConnections] = {}
    this[_wemoClient] = new wemoPromise()
    const wemoConfig = this[_loadWemoConfig](jsonObj)
    this[_activeConnections] = this[_loadHandlers](wemoConfig)
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  [_loadWemoConfig](jsonObj) {
    return new WemoConfig(jsonObj)
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  async [_loadHandlers](configObj) {
    let notAllDevsDiscovered = true

    // Continue to keep trying to get all of the devices configured
    while(notAllDevsDiscovered) {
      await this[_wemoClient].discover
        .then(deviceInfo => {
          // Look through the configured devices
          const handler = configObj.handlerConfig(deviceInfo.friendlyName)

          // Check to see if handler has been configured with the friendly name of the deviceInfo
          if (handler !== undefined) {
            // Found handler configuration now initializing the handler
            this[_activeConnections][handler['friendlyName']] = handlerObj[handler['handlerType']](this[_wemoClient], handler['retryTimes'])
          }

          // Checking to see if all handlers have been configured 
          if (Object.keys(this[_activeConnections]).length === configObj.handlerCount) {
            notAllDevsDiscovered = false
          }
        })
        .catch(err => {
          // If a WemoConnectorError has been thrown rethrow else create a new WemoConnectorError
          if (err instanceof WemoConnectorError){
            throw err
          } else {
            const errorDesc = `Encountered an error while trying to load the configured handlers, details ${error.message}`
            throw new WemoConnectorError(errorDesc)
          }
        })
    }
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  [_loadDeviceDiscovery](timeInterval, configObj) {
    this[_deviceDiscoveryObj] = new DeviceDiscovery(timeInterval)
    this[_deviceDiscoveryObj].on('DeviceDiscover', function(currentTime){
      // Checking to see if the active connections need to be updated
      if (Object.keys(this[_activeConnections]).length !== configObj.handlerCount) {
        const infoDesc = `Now refreshing the handler list at the time, ${currentTime}`
        this[_logger].info(infoDesc)
        await this[_loadHandlers](configObj)
      }
    })
    this[_deviceDiscoveryObj].startDeviceDiscovery()
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  [_loadStateRefresher]() {

  }

  /*
  * |======== PUBLIC ========|
  *
  */
  changeDeviceState() {

  }

  /*
  * |======== PUBLIC ========|
  *
  */
  setMode(mode) {
    this[_mode] = mode
  }

  /*
  * |======== PUBLIC ========|
  *
  */
  getMode() {
    return this[_mode]
  }
}
