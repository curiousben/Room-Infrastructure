const redisMQ =  require('redisMQ')
const bleLibrary = require('../lib/BLE.js')
const redisMQConfig = '/etc/opt/BLERelay/redisMQ.config'
const loggerConfig = '/etc/opt/BLERelay/logger.config'
const bleRelayConfig = '/etc/opt/BLERelay/BLERelay.config'

// Example payload
/*
 * {
 *   "device": {
 *     "uuid": "",
 *     "rssi": ""
 *   },
 *   "nodes": {
 *     "local_node": {
 *       "rssi": 0
 *     },
 *     "node1": {
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
  .then(publisher => this.publisher = publisher)
  .then(() => redisMQ.utils.loadJSON(bleRelayConfig))
  .then((bleRelayObj) => {
    this.bleRelayConfig = bleRelayObj
    this.publisher.logger.info('Successfully loaded the BLERelay configuration.')
    return
  })
  .then(() => bleLibrary.bleAdvertiseInit(this.bleRelayConfig, this.publisher.logger))
  .then(() => bleLibrary.bleListenInit(this.publisher.logger))
  .then(bleService => {
    bleService.on('discover', (peripheral) => {
      if (peripheral.advertisement.manufacturerData != undefined) {
        //bleLibrary.createPayload(peripheral)
        //  .then(payload => this.publisher.sendDirect(payload))
        //  .catch(err => this.publisher.logger.error("Encountered an error when publishing a message to the Redis Server. Details " + err))
        this.publisher.logger.info("Found registered device in room. Device: " + peripheral.advertisement.manufacturerData + "\n Sending this data to RedisMQ!")
      }
    })
  })
  .catch(err => {
    if (this.publisher == null) {
      console.error("----ERROR: BLERelay has encountered an error. Details " + err.message)
    } else {
      this.publisher.logger.error("BLERelay has encountered an error. Details " + err.message)
    }
    process.exit(1)
  })
