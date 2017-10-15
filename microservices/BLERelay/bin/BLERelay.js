const redisMQ =  require('redisMQ')
const bleLibrary = require('../lib/BLE.js')
const redisMQConfig = '/etc/opt/BLERelay/redisMQ.config'
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
  .then(publisher => this.publisher = publisher)
  //.then(() => this.bleRelayConfig = redisMQ.utils.loadJSON(bleRelayConfig))
  /*
  .then(() => {
    console.log("file location: " + bleRelayConfig)
    this.bleRelayConfig = redisMQ.utils.loadJSON(bleRelayConfig)
    console.log("Resulting Object: " + this.bleRelayConfig)
    console.log("Resulting Object properties: " + Object.getOwnPropertiesName(this.bleRelayConfig))
  })
  */
  .then(() => redisMQ.utils.loadJSON(bleRelayConfig))
  .then((bleRelayObj) => {
    this.bleRelayConfig = bleRelayObj
    this.publisher.logger.info('Successfully loaded the BLERelay configuration.')
  })
  .then(() => bleLibrary.bleAdvertiseInit(this.bleRelayConfig, this.publisher.logger))
  .then(() => bleLibrary.bleListenInit(this.publisher.logger))
  .then(bleService => {
    //let that = this
    bleService.on('discover', (peripheral) => {
      let manufactureID = ((peripheral.advertisement.manufacturerData == undefined) ? null : peripheral.advertisement.manufacturerData.toString('hex').slice(8,-12))
      if (this.bleRelayConfig.device.ids.includes(manufactureID)) {
        this.publisher.logger.info("Found registered device in room. Device: " + manufactureID + "\n Sending this data to RedisMQ!!")
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
