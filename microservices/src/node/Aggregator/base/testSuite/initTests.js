const cacheModule = require('../lib/init.js')
const winston = require('winston')
var logger = new winston.Logger({
  level: 'debug',
  transports: [
    new (winston.transports.Console)()
  ]
})
const chai = require('chai')
const sinon = require('sinon')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()
const configSingleObjectJSON = {
  'setup': 'internal',
  'storage': {
    'strategy': 'singleEvent',
    'policy': {
      'archiveBy': 'Object',
      'eventLimit': 2
    },
    'eventTrigger': {
      'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
      'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
    },
    'byteSizeWatermark': 6000000
  },
  'flushStrategy': 'single'
}

const configMultiObjectJSON = {
  'setup': 'internal',
  'storage': {
    'strategy': 'multiEvent',
    'policy': {
      'archiveBy': 'Object',
      'eventLimit': 2
    },
    'eventTrigger': {
      'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
      'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
    },
    'byteSizeWatermark': 6000000
  },
  'flushStrategy': 'single'
}

const configSingleArrayJSON = {
  'setup': 'internal',
  'storage': {
    'strategy': 'singleEvent',
    'policy': {
      'archiveBy': 'Array',
      'eventLimit': 2
    },
    'eventTrigger': {
      'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
      'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
    },
    'byteSizeWatermark': 6000000
  },
  'flushStrategy': 'single'
}

const configMultiArrayJSON = {
  'setup': 'internal',
  'storage': {
    'strategy': 'multiEvent',
    'policy': {
      'archiveBy': 'Array',
      'eventLimit': 2
    },
    'eventTrigger': {
      'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
      'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
    },
    'byteSizeWatermark': 6000000
  },
  'flushStrategy': 'single'
}

describe('Testing Single Event Object cache', function () {
  let cacheObj = null
  let configJSON = null
  beforeEach(function () {
    cacheObj = new cacheModule()
  })

  it('Testing the insertion of one event Cache Interface', function (done) {
    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (eventData === null) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey')).should.be.fulfilled
      })
  })

  it('Testing the updated value in the events cache', function (done) {
    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (eventData === JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}})) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey')).should.be.fulfilled
        .then(() => cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey2': {'testKey': 'testValue'}, 'testSecondaryKey3': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey')).should.be.fulfilled
      })
  })
/*
  it('Testing the insertion of one event Cache Interface', function (done) {
    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          Promise.all([cacheEvent, eventResult, eventData])
            .then(values => {
              if (values === ['ObjectCacheInsert', 'OK', null]) {
                return
              }
            }).should.notify(done)
        })

        Promise.resolve(cacheObj.processRecord(logger, {'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}, 'PrimaryKey', 'ObjectKey')).should.be.fulfilled
      })
  })


  it('Flush Object cache', function (done) {
    secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey1', JSON.stringify({'testKey': 'testValue'})).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToObjectCache(logger, that, 'testPrimaryKey', 'testSecondaryKey2', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.flushObjectCache(logger, that, 'testPrimaryKey')).should.become({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}})
      .then(function () {
        Promise.resolve(that.properties.numberOfEvents['all']).should.become(0)
        Promise.resolve(that.properties.numberOfEvents['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.properties.sizeOfCache['all']).should.become(0)
        Promise.resolve(that.properties.sizeOfCache['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.cache).should.eventually.not.have.property('testPrimaryKey')
      }).should.notify(done)
  })

*/

})
