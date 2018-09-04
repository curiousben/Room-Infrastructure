'use strict'

/*
 *
 *
 *
 *
*/

// Private variables
const _logger = Symbol('logger')

class BLEMessageBuilder {
  constructor (logger) {
    this[_logger] = logger
    this[_logger].debug(`BLE Message Builder has been configured`)
  }

  /*
* Description:
*   This promise creates a payload with the BLE device and NodeName
* Args:
*   configKey (String): This key is a JSONkey in the config file that houses the metadata for the publisher.
* Returns:
*   payload (Object) An promise that resolves with the results of a successfull publish of a message.
* Throws:
*   Error (Error): If the peripheral Object doesn't have the keys 'advertisement', 'manufacturerData',
*     or manufacturerData can't be stringified.
* Sameple Paylaod:
* {
*   "device": {
*     "uuid": "",
*     "rssi": ""
*   },
*   "node": {
*     "name": ""
*   }
* }
* TODO:
*   [#1]:
*/
  createPayload (peripheral, nodeName) {
    return new Promise(
      resolve => {
        const payload = {}
        const device = {}
        const node = {}
        device['uuid'] = peripheral.advertisement.manufacturerData.toString('hex')
        device['rssi'] = peripheral.rssi
        payload['device'] = device
        node['name'] = nodeName
        payload['node'] = node
        this[_logger].debug(`Created the payload ${JSON.stringify(payload, null, 2)}`)
        resolve(payload)
      }
    )
  }
}
module.exports = BLEMessageBuilder
