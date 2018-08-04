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
const WemoClient = util.promisify(wemo)
const DeviceScanner = require('./lib/processTimers/DeviceScanner.js')
const StateRefresh = require('./lib/processTimers/StateRefresher.js')

// Import errors
const WemoConnectorError = require('./lib/errors/WemoConnectorError.js')

// Import handlers
const handlerObj = require('./lib/handler/index.js')

// Import utilities
const WemoConfig = require('./lib/WemoConfig.js')

// Private variables
const _logger = Symbol('logger')
const _wemoClient = Symbol('wemoClient')
const _activeClients = Symbol('activeClients')
const _stateRefresherObj = Symbol('stateRefresherObj')
const _deviceScannerObj = Symbol('deviceScannerObj')
const _mode = Symbol('mode')

// Private methods
const _loadWemoConfig = Symbol('loadWemoConfig')
const _loadHandlers = Symbol('loadHandlers')
const _loadStateRefresher = Symbol('loadStateRefresher')
const _loadDeviceScanner = Symbol('loadDeviceScanner')
const _changeDeviceState = Symbol('changeDeviceState')

class WemoConnector {
  constructor(jsonObj, logger) {
    this[_logger] = logger
    this[_activeClients] = {}
    this[_wemoClient] = new wemoPromise()
    const wemoConfig = this[_loadWemoConfig](jsonObj)
    this[_activeClients] = this[_loadHandlers](wemoConfig)
    this[_loadDeviceScanner](wemoConfig)
    this[_loadStateRefresher](wemoConfig)
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
          // Look through the configured devices and grab the specfic handler configurations
          const handler = configObj.handlerConfig(deviceInfo.friendlyName)
          const handlerFriendlyName = ['friendlyName']
          const handlerType = handler['handlerType']
          const handlerRetryTimes = handler['retryTimes']

          // Found handler configuration now initializing the handler
          if (handler !== undefined) {

            // Intialize the handler  
            const handlerObj = WemoHandler.getHandler(handlerType, this[_wemoClient], handlerRetryTimes)

            // On an handler exception remove the handler so the WemoConnector can get a new handler
            handlerObj.on('WemoHandlerException', function(err){
              const errorDesc = `The ${handlerFriendlyName} encountered an exception, details ${err.message}. Removing the handler ...`
              this[_logger].error(errorDesc)
              delete this[_activeClients][handlerFriendlyName]
            })

            this[_activeClients][handlerFriendlyName] = handlerObj
          }

          // Checking to see if all handlers have been configured 
          if (Object.keys(this[_activeClients]).length === configObj.handlerCount) {
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
  [_loadDeviceScanner](configObj) {
    this[_deviceScannerObj] = new DeviceScanner(this[_logger], configObj.scannerInterval)

    // On the 'Discover' event checks to see if the active connections need to be updated
    this[_deviceScannerObj].on('Discover', function(currentTime){

      // Check to see connection count is lower than the configure handler count
      if (Object.keys(this[_activeClients]).length !== configObj.handlerCount) {
        const infoDesc = `Now refreshing the handler list at the time, ${currentTime}`
        this[_logger].info(infoDesc)

        // Load handlers
        await this[_loadHandlers](configObj)
      }
    })

    // Start the device scanner
    this[_deviceScannerObj].startDeviceScanner()
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  [_loadStateRefresher](config) {
    this[_stateRefresherObj] = new StateRefresh(this[_logger], config)

    // On the 'SwitchOff' event switch off lights
    this[_stateRefresherObj].on('SwitchOff', function(currentTime){
      this[_changeDeviceState]('Off')
    })
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  this[_changeDeviceState](desiredState) {
    Object.keys(this[_activeClients]).forEach(handler => {
      this[_activeClients][handler].changeDeviceState(desiredState)
    })
  }

  /*
  * |======== PUBLIC ========|
  *
  */
  set mode(mode){
    this[_mode] = mode
    this[_logger].info(`The mode for the WemoConnector is ${mode}`)
  }

  /*
  * |======== PUBLIC ========|
  *
  */
  processEvent(eventString) {
    if (mode === 'awake') {
      this[_stateRefresherObj].delayRefresh(eventString)
      this[_changeDeviceState]('On')
    }
  }
}
