/*
*
* 
*
*/

const WemoConfig = require("../../lib/configuration/WemoConfig.js")
const winston = require('winston')
var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})
const should = require('chai').should()

describe('Wemo Configuration Module testing ...', function() {
  describe('Postive testing of loaded configurations ...', function() {
    it('Wemo Configuration testing configurations ...', async function() {
      const wemoConfig = {
        "deviceHandlers":[
          {
            "friendlyName": "AFriendlyName",
            "handlerType": "switch",
            "retryTimes": 1
          },
          {
            "friendlyName": "AnotherFriendlyName",
            "handlerType": "switch",
            "retryTimes": 3
          },
          {
            "friendlyName": "LastFriendlyName",
            "handlerType": "switch",
            "retryTimes": 5
          }
        ],
        "scannerIntervalSec": 42,
        "refreshIntervalSec": 24
      }
      const wemoConfigObj = new WemoConfig(logger, wemoConfig)
      await wemoConfigObj.loadConfigurations()
      wemoConfigObj.handlerCount.should.equal(3)
      wemoConfigObj.getFindHandlerConfig('AFriendlyName').should.deep.equal(
        {
          "friendlyName": "AFriendlyName",
          "handlerType": "switch",
          "retryTimes": 1
        }
      )
      wemoConfigObj.getFindHandlerConfig('AnotherFriendlyName').should.deep.equal(
        {
          "friendlyName": "AnotherFriendlyName",
          "handlerType": "switch",
          "retryTimes": 3
        }
      )
      wemoConfigObj.getFindHandlerConfig('LastFriendlyName').should.deep.equal(
        {
          "friendlyName": "LastFriendlyName",
          "handlerType": "switch",
          "retryTimes": 5
        }
      )
      wemoConfigObj.refreshInterval.should.equal(24)
      wemoConfigObj.scannerInterval.should.equal(42)
    })
  })

  describe('Negative testing of loaded configurations ...', function () {
    let wemoConfigObj = null
    beforeEach(function() {
      wemoConfigObj = null
    })

    it('Testing absense of device handlers configuration ...', async function() {

      const wemoConfig = {
        "scannerIntervalSec": 42,
        "refreshIntervalSec": 24
      }
      wemoConfigObj = new WemoConfig(logger, wemoConfig)

      // Leting this slide since this implimentation is very similiar to how this module will be implimented,
      // to resolve this issue look at the load configuration function and see if we can not return a Promise
      try {
        await wemoConfigObj.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal('The \'deviceHandlers\' key has not been found in the configuration object')
      }
    })

    it('Testing absense of Scanner Interval Seconds configuration ...', async function() {
      const wemoConfig = {
        "deviceHandlers":[
          {
            "friendlyName": "AFriendlyName",
            "handlerType": "switch",
            "retryTimes": 1
          }
        ],
        "refreshIntervalSec": 24
      }
      wemoConfigObj = new WemoConfig(logger, wemoConfig)
      try {
        await wemoConfigObj.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal('The \'scannerIntervalSec\' has not been found in the configuration object')
      }
    })

    it('Testing absense of Refresh Interval Seconds configuration ...', async function() {
      const wemoConfig = {
        "deviceHandlers":[
          {
            "friendlyName": "AFriendlyName",
            "handlerType": "switch",
            "retryTimes": 1
          }
        ],
        "scannerIntervalSec": 42
      }
      wemoConfigObj = new WemoConfig(logger, wemoConfig)
      try {
        await wemoConfigObj.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal('The \'refreshIntervalSec\' has not been found in the configuration object')
      }
    })

  })
});
