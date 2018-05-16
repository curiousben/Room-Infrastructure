const cacheModule = require('../lib/init.js')
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
  const configSingleObjectJSON = {
    'setup': 'internal',
    'storage': {
      'strategy': 'singleEvent',
      'policy': {
        'archiveBy': 'Object',
        'eventLimit': 4
      },
      'byteSizeWatermark': 6000000
    }
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

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
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

        Promise.resolve(cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey'))
          .then(() => cacheObj.processRecord(logger, JSON.stringify({'testPrimaryKey': {'testSecondaryKey2': {'testKey': 'testValue'}, 'testSecondaryKey3': {'testKey': 'testValue'}}}), 'PrimaryKey', 'ObjectKey')).should.be.fulfilled
      })
  })

  it('Testing the insertion of a new event once a previous event has been setted Cache Interface', function (done) {
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

  it('Testing the updated value in the events cache', function (done) {
    let finalFlushedCache = {
      'PrimaryKey': {
        'ObjectKey1': 'ObjestValue1',
        'ObjectKey2': 'ObjectValue2',
        'ObjectKey3': 'ObjectValue3'
      }
    }
    cacheObj.initCache(logger, configSingleObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectCacheFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'ObjestValue1', 'PrimaryKey', 'ObjectKey1'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue2', 'PrimaryKey', 'ObjectKey2'))
          .then(() => cacheObj.processRecord(logger, 'ObjectValue3', 'PrimaryKey', 'ObjectKey3'))
          .then(() => cacheObj.flushCache(logger, 'cache', null)).should.be.fulfilled
      })
  })
})

describe('Testing Multi Event Object cache', function () {
  let cacheObj = null
  const configMultiObjectJSON = {
    'setup': 'internal',
    'storage': {
      'strategy': 'multiEvent',
      'policy': {
        'archiveBy': 'Object',
        'eventLimit': 5
      },
      'byteSizeWatermark': 6000000
    }
  }
  beforeEach(function () {
    cacheObj = new cacheModule()
  })

  it('Testing the insertion of one event Cache Interface', function (done) {
    cacheObj.initCache(logger, configMultiObjectJSON).should.be.fulfilled
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
    cacheObj.initCache(logger, configMultiObjectJSON).should.be.fulfilled
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

  it('Testing the Object flush with the event limit has been reached', function (done) {
    let finalFlushedCache = {
      'eventKey1': {
        'objectCacheKey1': 'testData1',
        'objectCacheKey2': 'testData2',
        'objectCacheKey3': 'testData3',
        'objectCacheKey4': 'testData4',
        'objectCacheKey5': 'testData5'
      }
    }
    cacheObj.initCache(logger, configMultiObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectEventFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'testData1', 'eventKey1', 'objectCacheKey1')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey1', 'objectCacheKey2')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'testData1', 'eventKey2', 'objectCacheKey1')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'testData3', 'eventKey1', 'objectCacheKey3')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'testData2', 'eventKey2', 'objectCacheKey2')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'testData4', 'eventKey1', 'objectCacheKey4')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'testData5', 'eventKey1', 'objectCacheKey5')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'testData1', 'eventKey3', 'objectCacheKey1')).should.be.fulfilled
      })
  })

  it('Testing the updated value in the events cache', function (done) {
    let finalFlushedCache = {
      'PrimaryKey': {
        'ObjectKey1': 'ObjestValue1',
        'ObjectKey2': 'ObjectValue2',
        'ObjectKey3': 'ObjectValue3'
      }
    }
    cacheObj.initCache(logger, configMultiObjectJSON).should.be.fulfilled
      .then(function () {
        cacheObj.on('FLUSH', function (cacheEvent, eventResult, eventData) {
          if (cacheEvent === 'ObjectCacheFlush' && JSON.stringify(eventData) === JSON.stringify(finalFlushedCache)) {
            done()
          }
        })

        Promise.resolve(cacheObj.processRecord(logger, 'ObjestValue1', 'PrimaryKey', 'ObjectKey1')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'ObjectValue2', 'PrimaryKey', 'ObjectKey2')).should.be.fulfilled
          .then(() => cacheObj.processRecord(logger, 'ObjectValue3', 'PrimaryKey', 'ObjectKey3')).should.be.fulfilled
          .then(() => cacheObj.flushCache(logger, 'cache', null)).should.be.fulfilled
      })
  })
})
