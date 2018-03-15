const secondaryCacheManagementModule = require('../../../../lib/cache/cacheInterface/utilities/secondaryCacheManagement.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the secondary cache management module', function () {
  let cache = {}

  before(function () {
    cache.properties = {}
    cache.properties.sizeOfCache = {
      'all': 0,
      'eventCaches': {}
    }
    cache.properties.numberOfEvents = {
      'all': 0,
      'eventCaches': {}
    }
  })

  it('Increase Event Size', function (done) {
    secondaryCacheManagementModule.increaseEventSize(cache.properties.numberOfEvents, 'testPrimaryKey', 'testSecondaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.numberOfEvents['all']).should.become(1)
      Promise.resolve(cache.properties.numberOfEvents['eventCaches']['testPrimaryKey']['testSecondaryKey']).should.become(1)
    }).should.notify(done)
  })

  it('Increase Buffer Size', function (done) {
    secondaryCacheManagementModule.increaseBufferSize(cache.properties.sizeOfCache, 42, 'testPrimaryKey', 'testSecondaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.sizeOfCache['all']).should.become(42)
      Promise.resolve(cache.properties.sizeOfCache['eventCaches']['testPrimaryKey']['testSecondaryKey']).should.become(42)
    }).should.notify(done)
  })

  it('Retreive Event Size', function () {
    return secondaryCacheManagementModule.getEventSize(cache.properties.numberOfEvents, 'testPrimaryKey', 'testSecondaryKey').should.become(1)
  })

  it('Retreive Buffer Size', function () {
    return secondaryCacheManagementModule.getCacheSize(cache.properties.sizeOfCache, 'testPrimaryKey', 'testSecondaryKey').should.become(42)
  })

  it('Reset Event Size', function (done) {
    secondaryCacheManagementModule.resetEventSize(cache.properties.numberOfEvents, 'testPrimaryKey', 'testSecondaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.numberOfEvents['all']).should.become(0)
      Promise.resolve(cache.properties.numberOfEvents['eventCaches']['testPrimaryKey']).should.become({})
    }).should.notify(done)
  })

  it('Reset Buffer Size', function (done) {
    secondaryCacheManagementModule.resetBufferSize(cache.properties.sizeOfCache, 'testPrimaryKey', 'testSecondaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.sizeOfCache['all']).should.become(0)
      Promise.resolve(cache.properties.sizeOfCache['eventCaches']['testPrimaryKey']).should.become({})
    }).should.notify(done)
  })
})
