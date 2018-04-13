const timeCacheInterfaceModule = require('../../../lib/cache/cacheInterface/timeCache.js')
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

describe('Testing the Time Cache Interface module', function () {
  let that = this
  beforeEach(function () {
    that.cache = {}
    that.config = {
      'setup': 'internal',
      'storage': {
        'strategy': 'singleEvent',
        'policy': {
          'archiveBy': 'time',
          'eventLimit': 2
        },
        'eventTrigger': {
          'primaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj'],
          'secondaryEvent': ['Path', 'to', 'data', 'in', 'JSONObj']
        },
        'byteSizeWatermark': 1000000
      },
      'flushStrategy': 'single'
    }
    that.properties = {}
    that.properties.sizeOfCache = {
      'all': 0,
      'eventCaches': {}
    }
    that.properties.numberOfEvents = {
      'all': 0,
      'eventCaches': {}
    }
  })

  it('Checking to see if the primary entry exists', function () {
    return timeCacheInterfaceModule.hasPrimaryEntry(that.cache, 'testPrimaryKey').should.become(false).should.be.fulfilled
      .then(timeCacheInterfaceModule.addEntryToTimeCache(that, 'testPrimaryKey', JSON.stringify({'test': 'test1'}))).should.be.fulfilled
      .then(timeCacheInterfaceModule.hasPrimaryEntry(that.cache, 'testPrimaryKey').should.become(true))
  })

  it('Create an entry in the time cache', function (done) {
    timeCacheInterfaceModule.addEntryToTimeCache(that, 'testPrimaryKey', JSON.stringify({'test': 'test1'})).should.be.fulfilled.then(function () {
      Promise.resolve(that.cache['testPrimaryKey']).should.become([Buffer.from(JSON.stringify({'test': 'test1'}))])
      Promise.resolve(that.properties.sizeOfCache['all']).should.become(16)
      Promise.resolve(that.properties.sizeOfCache['eventCaches']['testPrimaryKey']).should.become(16)
      Promise.resolve(that.properties.numberOfEvents['all']).should.become(1)
      Promise.resolve(that.properties.numberOfEvents['eventCaches']['testPrimaryKey']).should.become(1)
    }).should.notify(done)
  })

  it('Create an entry primary cache', function (done) {
    timeCacheInterfaceModule.addEntryToCache(that, 'testPrimaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(that.cache['testPrimaryKey']).should.become({})
    }).should.notify(done)
  })

  it('Update the entry to time cache', function (done) {
    timeCacheInterfaceModule.addEntryToTimeCache(that, 'testPrimaryKey', JSON.stringify({'test': 'test1'})).should.be.fulfilled
      .then(timeCacheInterfaceModule.updateEntryToTimeCache(that, 'testPrimaryKey', JSON.stringify({'test': 'test1'}))).should.be.fulfilled
      .then(function () {
        Promise.resolve(that.cache['testPrimaryKey']).should.become([Buffer.from(JSON.stringify({'test': 'test1'})), Buffer.from(JSON.stringify({'test': 'test1'}))])
        Promise.resolve(that.properties.sizeOfCache['all']).should.become(32)
        Promise.resolve(that.properties.sizeOfCache['eventCaches']['testPrimaryKey']).should.become(32)
        Promise.resolve(that.properties.numberOfEvents['all']).should.become(2)
        Promise.resolve(that.properties.numberOfEvents['eventCaches']['testPrimaryKey']).should.become(2)
      }).should.notify(done)
  })

  it('Checking to see if cache needs to be flushed', function (done) {
    timeCacheInterfaceModule.addEntryToTimeCache(that, 'testPrimaryKey', JSON.stringify({'test': 'test1'})).should.be.fulfilled
      .then(function () {
        Promise.resolve().then(() => timeCacheInterfaceModule.doesCacheTimeNeedFlush(that, 'testPrimaryKey')).should.become(false)
      }).then(() => timeCacheInterfaceModule.updateEntryToTimeCache(that, 'testPrimaryKey', JSON.stringify({'test': 'test1'}))).should.be.fulfilled.then(function () {
        Promise.resolve().then(() => timeCacheInterfaceModule.doesCacheTimeNeedFlush(that, 'testPrimaryKey')).should.become(true)
      }).should.notify(done)
  })

  it('Flushing the time cache', function () {
    return timeCacheInterfaceModule.addEntryToTimeCache(that, 'testPrimaryKey', JSON.stringify({'test': 'test1'})).should.be.fulfilled
      .then(timeCacheInterfaceModule.updateEntryToTimeCache(that, 'testPrimaryKey', JSON.stringify({'test': 'test1'}))).should.be.fulfilled
      .then(timeCacheInterfaceModule.flushTimeCache(that, 'testPrimaryKey').should.become([Buffer.from(JSON.stringify({'test': 'test1'})), Buffer.from(JSON.stringify({'test': 'test1'}))]))
  })

})
