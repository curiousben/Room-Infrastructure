const redisMQ =  require('redisMQ')
const bleLibrary = require('../lib/BLE.js')
const redisMQConfig = '/etc/opt/BLERelay/redismq.config'
const loggerConfig = '/etc/opt/BLERelay/logger.config'
const bleRelayConfig = '/etc/opt/BLERelay/BLERelay.config'

// Example payload
/*
 * {
 *   "uuid": "device_uuid",
 *   "rssi": some_value,
 *   "nodes": { 
 *     "local_node": {
 *       "rssi": 0
 *     },
 *     "node_1": {
 *       "rssi": some_value
 *     }
 *     .
 *     .
 *     .
 *   }
 * }
 *
*/
// Starting the producer 
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'ble.relay')
  .then(publisher => {
    this.publisher = publisher
    console.log('----INFO: Publisher has been initialized');
  })
  .then(() => {
    this.bleRelayConfig = redisMQ.loadJSON(bleRelayConfig)
    this.publisher.logger.info('BLERelay configuration has been successfully loaded.')
  })
  .then(() => bleLibrary.bleAdvertiseInit(this.bleRelayConfig, this.publisher.logger))
  .then(() => bleLibrary.bleListenInit(this.publisher.logger))
  .then(bleService => {
    bleService.on('discover', function(peripheral) {
      console.log('Found device with local name: ' + peripheral.advertisement.localName);
      console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
  	  this.publisher.produce('topic',-1, 'Values from peripherals','BLE-SkepOne');
    });
  })
  .catch(err => this.publisher.logger.error("BLERelay has encountered an error. Details " + err.message))
