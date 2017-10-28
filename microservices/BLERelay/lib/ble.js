/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
const util = require('util')
const bluebird = require('bluebird')
let noble = bluebird.promisifyAll(require('noble'))
let bleno = bluebird.promisifyAll(require('bleno'))

/*
* Description:
*   This function craetes the service that will be advertised by the bleno
* Args:
*   configJSON (JSON): This object is the configuration of the BLERelay microservice.
* Returns:
*   N/A
* Throws:
*   N/A
* Notes:
*   This needs function needs a constructor so fat arrows can't be used here.
* TODO:
*   [#1]: Resarch more into .replace since this is most likely the place where an error can be thrown
*     using this method.
*/
function nodeService(configJSON) {
    bleno.PrimaryService.call(this, {
        uuid: configJSON.node.name,
        characteristics: []
    })
}
util.inherits(nodeService, bleno.PrimaryService)

/*
* Description:
*   This promise initializes the BLE general listener.
* Args:
*   logger (Logger): This is the logger that is provided by the logger from the publisher.
* Returns:
*   Noble (Promise): The noble that has been configured to listen to all incoming BLE traffic.
* Throws:
*   (Error):
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let bleListenInit = logger => {
  return new Promise(
    (resolve) => {
      noble.on('scanStart', function () {
        logger.info('... BLE listener service has started scanning.')
      });
      noble.on('scanStop', function () {
        logger.info('... BLE listener service has stopped scanning.')
      });
      noble.on('stateChange', function (state) {
        switch (state) {
          case 'poweredOn':
            logger.info('BLE listener service is starting ...')
            noble.startScanningAsync([], true)
              .then(() => logger.info('... BLE listener service has started'))
              .catch(err => logger.info('... Failed to start BLE listener service. Details: ' + err.message))
            break;
          case 'resetting':
            logger.info('BLE listener service resetting ...')
            break;
          case 'unsupported':
            logger.error('BLE listener service is unsupported on this device. Shutting down service ...')
            noble.stopScanningAsync()
              then(() => logger.info('... BLE listener service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE listener service. Details: ' + err.message))
            break;
          case 'unathorized':
            logger.error('BLE listener service is unauthorized on this device. Shutting down service ...')
            noble.stopScanningAsync()
              then(() => logger.info('... BLE listener service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE listener service. Details: ' + err.message))
            break;
          case 'unknown':
            logger.error('BLE listener service has encountered an unknown state. Shutting down service ...')
            noble.stopScanningAsync()
              then(() => logger.info('... BLE listener service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE listener service. Details: ' + err.message))
          case 'powerOff':
            logger.error('BLE listener service is powering off. Shutting down service ...')
            noble.stopScanningAsync()
              then(() => logger.info('... BLE listener service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE listener service. Details: ' + err.message))
        }
      });
      resolve(noble);
    }
  )
}

/*
* Description:
*   This promise creates a publisher instance that can send messages to a queue directly.
* Args:
*   logger (Logger): This is the logger that is provided by the logger from the publisher.
*   configJSON (JSON): This object is the configuration of the BLERelay microservice.
* Returns:
* Returns:
*   Publisher (Promise) An promise that resolves with the results of a successfull publish of a message.
* Throws:
*   Error (Error): 
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let bleAdvertiseInit = (configJSON, service, logger) => {
  return new Promise(
    (resolve) => {
      bleno.on('stateChange', function (state) {
        switch (state) {
          case 'poweredOn':
            logger.info('BLE advertising service is starting ...')
            bleno.startAdvertisingAsync(configJSON.node.name, [service.uuid])
              .then(() => logger.info('... BLE advertising service has started'))
              .catch(err => logger.error('... Failed to start BLE advertising service. Details: ' + err.message))
            break;
          case 'resetting':
            logger.info('BLE advertising service resetting ...')
            break;
          case 'unsupported':
            logger.error('BLE advertising service is unsupported on this device. Shutting down service ...')
            bleno.stopAdvertisingAsync()
              .then(() => logger.info('... BLE advertising service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE advertising service. Details: ' + err.message))
            break;
          case 'unathorized':
            logger.error('BLE advertising service is unauthorized on this device. Shutting down service ...')
            bleno.stopAdvertisingAsync()
              .then(() => logger.info('... BLE advertising service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE advertising service. Details: ' + err.message))
            break;
          case 'unknown':
            logger.error('BLE advertising service has encountered an unknown state. Shutting down service ...')
            bleno.stopAdvertisingAsync()
              .then(() => logger.info('... BLE advertising service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE advertising service. Details: ' + err.message))
          case 'powerOff':
            logger.error('BLE advertising service is powering off. Shutting down service ...')
            bleno.stopAdvertisingAsync()
              .then(() => logger.info('... BLE advertising service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE advertising service. Details: ' + err.message))
        }
      })
      bleno.on('advertisingStart', function (error) {
        if (!error) {
          bleno.setServices([
            service
          ])
          logger.info('... Advertising has started')
        } else {
          logger.error('Failed to start advertising BLE. Details: ' + error.message)
        }
      })
      bleno.on('advertisingStop', function () {
        logger.info('... Advertising has stopped.')
      })
      resolve(bleno)
    }
  )
}

/*
* Description:
*   This promise creates a publisher instance that can send messages to a queue directly.
* Args:
*   configKey (String): This key is a JSONkey in the config file that houses the metadata for the publisher.
* Returns:
*   Publisher (Promise) An promise that resolves with the results of a successfull publish of a message.
* Throws:
*   SomeError (Error):
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let createPayload = (peripheral) => {
  return new Promise(
    resolve => {
      let payload = {}
      let device = {}
      device["uuid"] = peripheral.advertisement.manufacturerData
      device["rssi"] = peripheral.rssi
      payload["device"] = device
      resolve(payload)
    }
  )
}

module.exports = {
  bleAdvertiseInit: bleAdvertiseInit,
  bleListenInit: bleListenInit,
  createPayload: createPayload,
  nodeService: nodeService
}
