/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
const bluebird = require('bluebird')
let noble = bluebird.promisifyAll(require('noble'))

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
let createPayload = (peripheral, configJSON) => {
  return new Promise(
    resolve => {
      let payload = {}
      let device = {}
      let node = {}
      device["uuid"] = peripheral.advertisement.manufacturerData.toString('hex')
      device["rssi"] = peripheral.rssi
      payload["device"] = device
      node["name"] = configJSON.node.name
      payload["node"] = node
      resolve(payload)
    }
  )
}

module.exports = {
  bleListenInit: bleListenInit,
  createPayload: createPayload
}
