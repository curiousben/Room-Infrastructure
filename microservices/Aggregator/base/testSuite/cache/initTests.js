const cacheModule = require('../../lib/cache/init.js')
const winston = require('winston')
var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the secondary Cache Interface module', function () {
  let cacheObj = null
  let configJSON = null
  beforeEach(function () {
    configJSON = {
      'setup': 'internal',
      'storage': {
        'strategy': 'singleEvent',
        'policy': {
          'archiveBy': 'secondary',
          'eventLimit': 2
        },
        'eventTrigger': {
          'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
          'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
        },
        'byteSizeWatermark': 46
      },
      'flushStrategy': 'single'
    }
    cacheObj = new cacheModule()
  })

  it('Testing the initialization of the Cache Interface', function (done) {
    cacheObj.initCache(logger, configJSON).should.be.fulfilled
      .then( => cacheModule.
  })
})
