/*
 *
 *
 *
 *
 *
*/

// Import modules
const util = require('util')
const wemo = require('wemo-client')
const WemoClient = util.promisify(wemo)
const HandleLoader = require('./lib/handlerLoader/handlerLoader.js')
const DeviceScanner = require('./lib/utilityProcesses/DeviceScanner.js')
const StateRefresh = require('./lib/utilityProcesses/StateRefresher.js')

// Import utilities
const WemoConfig = require('./lib/configuration/WemoConfig.js')

// Private variables
const _logger = Symbol('logger')
const _wemoClientInst = Symbol('wemoClientInst')
const _configInst = Symbol('wemoConfigInst')
const _activeClients = Symbol('activeClients')
const _handleLoaderInst = Symbol('handleLoaderInst')
const _stateRefresherInst = Symbol('stateRefresherInst')
const _deviceScannerInst = Symbol('deviceScannerInst')
const _mode = Symbol('mode')

// Private methods
const _loadHandlers = Symbol('loadHandlers')
const _getHandler = Symbol('getHandler')
const _loadStateRefresher = Symbol('loadStateRefresher')
const _loadDeviceScanner = Symbol('loadDeviceScanner')
const _changeDeviceState = Symbol('changeDeviceState')

class WemoConnector {
  constructor (logger, jsonObj) {
    this[_logger] = logger
    this[_activeClients] = {}
    this[_handleLoaderInst] = new HandleLoader()
    this[_wemoClientInst] = WemoClient
    this[_configInst] = new WemoConfig(this[_logger], jsonObj)
  }

  async loadWemoConfig () {
    await this[_configInst].loadConfigurations()
  }

  /*
  * |======== PUBLIC ========|
  *
  */
  async initializeWemoConnector () {
    this[_activeClients] = await this[_loadHandlers](this[_configInst])
    await this[_loadDeviceScanner](this[_configInst].scannerInterval)
    await this[_loadStateRefresher](this[_configInst].refreshInterval)
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  async [_loadHandlers] (configObj) {
    let notAllDevsDiscovered = true

    // Continue to keep trying to get all of the devices configured
    while (notAllDevsDiscovered) {
      await this[_wemoClientInst].discover
        .then(deviceInfo => this[_getHandler](this[_wemoClientInst], deviceInfo, this[_configInst]))
        .catch(err => {
          // If a WemoConnectorError has been thrown rethrow else create a new WemoConnectorError
          const errorDesc = `Encountered an error while trying to load the configured handlers, details ${err.message}`
          throw new Error(errorDesc)
        })

      // Checking to see if all handlers have been configured
      if (Object.keys(this[_activeClients]).length === this[_configInst].handlerCount) {
        notAllDevsDiscovered = false
      }
    }
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  async [_getHandler] (connection, deviceInfo, configInst) {
    // Look through the configured devices and grab the specfic handler configurations
    const handlerConfig = configInst.handlerConfig(deviceInfo.friendlyName)

    // Found handler configuration now initializing the handler
    if (handlerConfig !== undefined) {
      // Get Individual Configurations
      const handlerFriendlyName = handlerConfig['friendlyName']
      const handlerType = handlerConfig['handlerType']
      const handlerRetryTimes = handlerConfig['retryTimes']

      // Intialize the handler
      const handlerInst = this[_handleLoaderInst].getHandler(this[_logger], handlerType, connection, handlerRetryTimes)

      // On an handler exception remove the handler so the WemoConnector can get a new handler
      handlerInst.on('WemoHandlerException', function (err) {
        const errorDesc = `The ${handlerFriendlyName} encountered an exception, details ${err.message}. Removing the handler ...`
        this[_logger].error(errorDesc)
        delete this[_activeClients][handlerFriendlyName]
      })

      this[_activeClients][handlerFriendlyName] = handlerInst
    }
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  async [_loadDeviceScanner] (configObj) {
    this[_deviceScannerInst] = new DeviceScanner(this[_logger], configObj.scannerInterval)

    // On the 'Discover' event checks to see if the active connections need to be updated
    this[_deviceScannerInst].on('Discover', async function (currentTime) {
      // Check to see connection count is lower than the configure handler count
      if (Object.keys(this[_activeClients]).length !== configObj.handlerCount) {
        const infoDesc = `Now refreshing the handler list at the time, ${currentTime}`
        this[_logger].info(infoDesc)

        // Load handlers
        try {
          await this[_loadHandlers](configObj)
        } catch (err) {
          const errorDesc = `Failed to reload the handlers details ${err}`
          this[_logger].error(errorDesc)
        }
      }
    })

    // Start the device scanner
    await this[_deviceScannerInst].startDeviceScanner()
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  async [_loadStateRefresher] (config) {
    this[_stateRefresherInst] = new StateRefresh(this[_logger], config)

    // On the 'SwitchOff' event switch off lights
    this[_stateRefresherInst].on('SwitchOff', function (currentTime) {
      this[_changeDeviceState]('Off')
    })

    await this[_stateRefresherInst].startStateRefresher()
  }

  /*
  * |======== PRIVATE ========|
  *
  */
  [_changeDeviceState] (desiredState) {
    Object.keys(this[_activeClients]).forEach(handler => {
      this[_activeClients][handler].changeDeviceState(desiredState)
    })
  }

  /*
  * |======== PUBLIC ========|
  *
  */
  setMode (mode) {
    this[_mode] = mode
    this[_logger].info(`The mode for the WemoConnector is ${mode}`)
    return mode
  }

  /*
  * |======== PUBLIC ========|
  *
  */
  processEvent (eventString) {
    if (this[_mode] === 'Awake') {
      this[_stateRefresherInst].delayRefresh(eventString)
      this[_changeDeviceState]('On')
    }
  }
}
module.exports = WemoConnector
