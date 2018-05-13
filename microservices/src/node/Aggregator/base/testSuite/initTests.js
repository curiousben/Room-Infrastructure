const cacheModule = require('../lib/init.js')
const winston = require('winston')
var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})
const chai = require('chai')
const sinon = require('sinon')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()


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
  const configSingleObjectJSON = {
    'setup': 'internal',
    'storage': {
      'strategy': 'singleEvent',
      'policy': {
        'archiveBy': 'Object',
        'eventLimit': 4
      },
      'eventTrigger': {
        'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
        'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
      },
      'byteSizeWatermark': 6000000
    },
    'flushStrategy': 'single'
  }  
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

  it('Testing the insertion of one event Cache Interface', function (done) {
    let flushResult = false
    let insertResult = false
    let finalFlushedCache = {
      'eventKey': {
        'objectCacheKey1': 'testData1',
        'objectCacheKey2': 'testData2',
        'objectCacheKey3': 'testData3'
      }
    }
    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('INSERT', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'FlushedObjectCacheInsert' && eventData === null) {
            insertResult = true
          }
          if (insertResult && flushResult) {
            done()
          }
        })

        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          //console.log('FLUSH in test cacheEvent: ' + cacheEvent + " eventResult: " + eventResult + " eventData: " + JSON.stringify(eventData))
          if (cacheEvent === 'EventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            flushResult = true
          }
          if (insertResult && insertResult) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey', 'objectCacheKey1')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey', 'objectCacheKey2')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey', 'objectCacheKey3')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'testData1', 'eventKey2', 'objectCacheKey')).should.be.fulfilled
      })
  })
/*

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
