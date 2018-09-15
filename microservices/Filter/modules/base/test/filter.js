/*
*
*
*
*/

const WemoConnector = require('../api.js')
const winston = require('winston')
var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})
require('chai').should()

describe('Wemo Module testing ...', function () {
  beforeEach(function () {
    // runs before each test in this block
  })

  it('Testing basic initialization of Module', async function () {
    const jsonObj = {
      'deviceHandlers': [
        {
          'friendlyName': 'AFriendlyName',
          'handlerType': 'switch',
          'retryTimes': 3
        }
      ],
      'scannerIntervalSec': 5,
      'refreshIntervalSec': 5
    }

    const WemoConnectorInst = new WemoConnector(logger, jsonObj)
    try {
      await WemoConnectorInst.loadWemoConfig()
      WemoConnectorInst.setMode('Awake').should.equal('Awake')
    } catch (err) {
      throw err
    }
  })
})
