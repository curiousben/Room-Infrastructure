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
 *   "node": {
 *     "name": ""
 *   }
 * }
 *
*/
// Starting the producer
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'ble.relay')
  .then(publisher => this.publisher = publisher)
  .then(() => redisMQ.utils.loadJSON(bleRelayConfig))
  .then(bleRelayObj => {
    this.bleRelayConfig = bleRelayObj
    this.publisher.logger.info('Successfully loaded the BLERelay configuration.')
    return
  })
  .then(() => bleLibrary.bleListenInit(this.publisher.logger))
  .then(bleListener => {
    bleListener.on('discover', (peripheral) => {
      if (peripheral.advertisement.manufacturerData != undefined) {
        bleLibrary.createPayload(peripheral, this.bleRelayConfig)
          .then(payload => {
            this.publisher.logger.info('Sending payload: ' + JSON.stringify(payload, null, 2))
            return payload
          })
          .then(payload => this.publisher.sendDirect(payload))
          .then(result => {
            if (result == 'OK') {
              this.publisher.logger.info('Sent payload to RedisMQ')
            }
          })
          .catch(err => this.publisher.logger.error("Encountered an error when publishing a message to the Redis Server. Details " + err))
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
