/*
*
*
*
*/

const BLEMessageBuilder = require('../../lib/utilities/BLEMessageBuilder.js')
const winston = require('winston')
var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})
require('chai').should()

describe('BLE Builder Module testing ...', function () {
  describe('Postive testing of building messages...', function () {
    it('BLE Builder builds a message ...', async function () {
      const bleBuilderConfigObj = new BLEMessageBuilder(logger)
      const peripheral = {}
      peripheral.rssi = '42'
      peripheral.advertisement = {}
      peripheral.advertisement.manufacturerData = Buffer.from('test')
      const nodeName = 'TestNodeName'
      const msg = await bleBuilderConfigObj.createPayload(peripheral, nodeName)
      msg.should.deep.equal({
        'device': {
          'uuid': '74657374',
          'rssi': '42'
        },
        'node': {
          'name': 'TestNodeName'
        }
      })
    })
  })

  describe('Negative testing of building messages ...', function () {
    it('BLE Builder fails to build a message ...', async function () {
      const bleBuilderConfigObj = new BLEMessageBuilder(logger)
      const peripheral = {}
      peripheral.rssi = '42'
      const nodeName = 'TestNodeName'
      try {
        await bleBuilderConfigObj.createPayload(peripheral, nodeName)
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal('Cannot read property \'manufacturerData\' of undefined')
      }
    })
  })
})
