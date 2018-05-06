let initializationModule = require('../../lib/utilities/initialize.js')
let InitializationError = require('../../lib/errors/initializationError.js')

const validConfig = {
  'cache': {
    'setup': 'external',
    'storage': {
      'strategy': 'singleEvent',
      'policy': {
        'archiveBy': 'time',
        'eventLimit': 10
      },
      'eventTrigger': {
        'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
        'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
      },
      'byteSizeWatermark': 1000000
    },
    'flushStrategy': 'single'
  }
}

const invalidConfig = {
  'cache': {
    'setup': 'external',
    'storage': {
      'strategy': 42,
      'policy': {
        'archiveBy': 'time',
        'eventLimit': 10
      },
      'eventTrigger': {
        'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
        'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
      },
      'byteSizeWatermark': 1000000
    },
    'flushStrategy': 'single'
  }
}

let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the initialization promise for the Aggregator configuration', function () {
  it('Pass in a valid configuration file', function () {
    return initializationModule.initAggregator(validConfig).should.be.become(validConfig['cache'])
  })
  it('Pass in an invalid configuration file', function () {
    return initializationModule.initAggregator(invalidConfig).should.be.rejectedWith(InitializationError)
  })
})
