const secondaryCacheInterfaceModule = require('../../../lib/cache/cacheInterface/secondaryCache.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the secondary Cache Interface module', function () {
  let that = this
  beforeEach(function () {
    that.cache = {}
    that.config = {
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

  it('Checking if Secondary Entry exist', function (done) {
    secondaryCacheInterfaceModule.hasSecondaryEntry('testPrimaryKey', 'testSecondaryKey', that.cache).should.become(false).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey', 'testSecondaryKey', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.hasSecondaryEntry('testPrimaryKey', 'testSecondaryKey', that.cache)).should.become(true).should.notify(done)
  })

  it('Create a Secondary Entry in cache', function (done) {
    secondaryCacheInterfaceModule.hasSecondaryEntry('testPrimaryKey', 'testSecondaryKey', that.cache).should.become(false).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey', 'testSecondaryKey', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(function () {
        Promise.resolve(that.cache['testPrimaryKey']['testSecondaryKey']).should.become(Buffer.from(JSON.stringify({'testKey': 'testValue'})))
        Promise.resolve(secondaryCacheInterfaceModule.hasSecondaryEntry('testPrimaryKey', 'testSecondaryKey', that.cache)).should.become(true)
      }).should.notify(done)
  })

  it('Update secondary entry in cache', function (done) {
    secondaryCacheInterfaceModule.hasSecondaryEntry('testPrimaryKey', 'testSecondaryKey', that.cache).should.become(false).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey', 'testSecondaryKey', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.hasSecondaryEntry('testPrimaryKey', 'testSecondaryKey', that.cache)).should.become(true).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.updateEntryToSecondCache(that, 'testPrimaryKey', 'testSecondaryKey', JSON.stringify({'testKeyThatisLargerByThanThePrevious': 'testValueThatisLargerByThanThePrevious'}))).should.become(Buffer.from(JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(function () {
        Promise.resolve(that.cache['testPrimaryKey']['testSecondaryKey']).should.become(Buffer.from(JSON.stringify({'testKeyThatisLargerByThanThePrevious': 'testValueThatisLargerByThanThePrevious'})))
      }).should.notify(done)
  })

  it('Checking if event cache need to be flushed', function (done) {
    secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey', 'testSecondaryKey1', JSON.stringify({'testKey': 'testValue'})).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.doesCacheSecondaryNeedFlush(that, 'testPrimaryKey', 'testSecondaryKey1')).should.become(false).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey', 'testSecondaryKey2', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.doesCacheSecondaryNeedFlush(that, 'testPrimaryKey', 'testSecondaryKey1')).should.become(true).should.notify(done)
  })

  it('Flush secondary cache', function (done) {
    secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey', 'testSecondaryKey1', JSON.stringify({'testKey': 'testValue'})).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey', 'testSecondaryKey2', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.flushSecondaryEventCache(that, 'testPrimaryKey')).should.become({'testPrimaryKey': {'testSecondaryKey1': {'testKey': 'testValue'}, 'testSecondaryKey2': {'testKey': 'testValue'}}})
      .then(function () {
        Promise.resolve(that.properties.numberOfEvents['all']).should.become(0)
        Promise.resolve(that.properties.numberOfEvents['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.properties.sizeOfCache['all']).should.become(0)
        Promise.resolve(that.properties.sizeOfCache['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.cache).should.eventually.not.have.property('testPrimaryKey')
      }).should.notify(done)
  })

  it('Flush whole cache', function (done) {
    secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey', 'testSecondaryKey1', JSON.stringify({'testKey': 'testValue'})).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey', 'testSecondaryKey2', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey1', 'testSecondaryKey1', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.addEntryToSecondCache(that, 'testPrimaryKey1', 'testSecondaryKey2', JSON.stringify({'testKey': 'testValue'}))).should.be.fulfilled
      .then(() => secondaryCacheInterfaceModule.flushCache(that)).should.become({"testPrimaryKey": {"testSecondaryKey1": {"testKey": "testValue"}, "testSecondaryKey2": {"testKey": "testValue" }}, "testPrimaryKey1": {"testSecondaryKey1": {"testKey": "testValue"}, "testSecondaryKey2": { "testKey": "testValue" }}})
      .then(function () {
        Promise.resolve(that.properties.numberOfEvents['all']).should.become(0)
        Promise.resolve(that.properties.numberOfEvents['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.properties.sizeOfCache['all']).should.become(0)
        Promise.resolve(that.properties.sizeOfCache['eventCaches']).should.eventually.not.have.property('testPrimaryKey')
        Promise.resolve(that.cache).should.eventually.not.have.property('testPrimaryKey')
      }).should.notify(done)
  })

})
