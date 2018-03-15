const timeCacheManagementModule = require('../../../../lib/cache/cacheInterface/utilities/timeCacheManagement.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the time cache management module', function () {
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
    timeCacheManagementModule.increaseEventSize(cache.properties.numberOfEvents, 'testPrimaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.numberOfEvents['all']).should.become(1)
      Promise.resolve(cache.properties.numberOfEvents['eventCaches']['testPrimaryKey']).should.become(1)
    }).should.notify(done)
  })

  it('Increase Buffer Size', function (done) {
    timeCacheManagementModule.increaseBufferSize(cache.properties.sizeOfCache, 42, 'testPrimaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.sizeOfCache['all']).should.become(42)
      Promise.resolve(cache.properties.sizeOfCache['eventCaches']['testPrimaryKey']).should.become(42)
    }).should.notify(done)
  })

  it('Retreive Event Size', function () {
    return timeCacheManagementModule.getEventSize(cache.properties.numberOfEvents, 'testPrimaryKey').should.become(1)
  })

  it('Retreive Buffer Size', function () {
    return timeCacheManagementModule.getCacheSize(cache.properties.sizeOfCache, 'testPrimaryKey').should.become(42)
  })

  it('Reset Event Size', function (done) {
    timeCacheManagementModule.resetEventSize(cache.properties.numberOfEvents, 'testPrimaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.numberOfEvents['all']).should.become(0)
      Promise.resolve(cache.properties.numberOfEvents['eventCaches']).should.become({})
    }).should.notify(done)
  })

  it('Reset Buffer Size', function (done) {
    timeCacheManagementModule.resetBufferSize(cache.properties.sizeOfCache, 'testPrimaryKey').should.be.fulfilled.then(function () {
      Promise.resolve(cache.properties.sizeOfCache['all']).should.become(0)
      Promise.resolve(cache.properties.sizeOfCache['eventCaches']).should.become({})
    }).should.notify(done)
  })
})
