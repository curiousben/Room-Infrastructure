/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
const bluebird = require('bluebird')
let noble = require('noble')
let bleno = require('bleno')

// Promisifing the bleno and noble clients
bluebird.promisifyAll(noble)
bluebird.promisifyAll(bleno)

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

let bleAdvertiseInit = (configJSON, logger) => {
  return new Promise(
    (resolve) => {
      bleno.on('stateChange', function (state) {
        switch (state) {
          case 'poweredOn':
            logger.info('BLE advertising service is starting ...')
            noble.startAdvertisingAsync(configJSON['node.uuid'], true)
              .then(() => logger.info('... BLE advertising service has started'))
              .catch(err => logger.error('... Failed to start BLE advertising service.'))
            break;
          case 'resetting':
            logger.info('BLE advertising service resetting ...')
            break;
          case 'unsupported':
            logger.error('BLE advertising service is unsupported on this device. Shutting down service ...')
            noble.stopAdvertisingAsync()
              .then(() => logger.info('... BLE advertising service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE advertising service. Details: ' + err.message))
            break;
          case 'unathorized':
            logger.error('BLE advertising service is unauthorized on this device. Shutting down service ...')
            noble.stopAdvertisingAsync()
              .then(() => logger.info('... BLE advertising service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE advertising service. Details: ' + err.message))
            break;
          case 'unknown':
            logger.error('BLE advertising service has encountered an unknown state. Shutting down service ...')
            noble.stopAdvertisingAsync()
              .then(() => logger.info('... BLE advertising service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE advertising service. Details: ' + err.message))
          case 'powerOff':
            logger.error('BLE advertising service is powering off. Shutting down service ...')
            noble.stopAdvertisingAsync()
              .then(() => logger.info('... BLE advertising service has been shutdown.'))
              .catch(err => logger.error('... Failed to shutdown BLE advertising service. Details: ' + err.message))
        }   
      })
      bleno.on('advertisingStart', function (error) {
        if (!error) {
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

module.exports = {
  bleAdvertiseInit: bleAdvertiseInit,
  bleListenInit: bleListenInit 
}
