/*
*
*
*
*/

const BLEConfig = require('../../lib/config/BLEConfig.js')
const winston = require('winston')
var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})
require('chai').should()

describe('BLE Configuration Module testing ...', function () {
  describe('Postive testing of loaded configurations ...', function () {
    it('BLE Configuration testing configurations ...', async function () {
      const bleConfig = {
        'node': {
          'name': 'TestNode'
        }
      }
      const bleConfigObj = new BLEConfig(logger, bleConfig)
      await bleConfigObj.loadConfigurations()
      bleConfigObj.nodeName.should.equal('TestNode')
    })
  })

  describe('Negative testing of loaded configurations ...', function () {
    let bleConfigObj = null
    beforeEach(function () {
      bleConfigObj = null
    })

    it('Testing absense of \'node\' in the configuration ...', async function () {
      const bleConfig = {
        'nodeTest': {
          'name': 'TestNode'
        }
      }
      bleConfigObj = new BLEConfig(logger, bleConfig)

      // Leting this slide since this implimentation is very similiar to how this module will be implimented,
      // to resolve this issue look at the load configuration function and see if we can not return a Promise
      try {
        await bleConfigObj.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal('The \'node\' key has not been found in the configuration object')
      }
    })

    it('Testing absense of \'name\' in the configuration ...', async function () {
      const bleConfig = {
        'node': {
          'nameTest': 'TestNode'
        }
      }
      bleConfigObj = new BLEConfig(logger, bleConfig)
      try {
        await bleConfigObj.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal('The \'name\' key has not been found in the \'node\' object')
      }
    })
  })
})
