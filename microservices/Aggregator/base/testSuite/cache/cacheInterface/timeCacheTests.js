const timeCacheInterfaceModule = require('lib/cache/cacheInterface/timeCache.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the Time Cache Interface module', function () {
  let cacheInstance = null
  beforeEach(function () {
    cacheInstance.cache = null
    cacheInstance.config = {}
    cacheInstance.properties = {}
  })

  it('Create an entry primary cache', function () {
    return timeCacheInterfaceModule.addEntryToPrimaryCache(cacheInstance, 'testPrimaryKey', JSON.stringify({'test': 'test1'})).should.become()
  })

  it('Create an entry in the time cache', function () {
    return timeCacheInterfaceModule.addEntryToTimeCache().should.become()
  })

  it('Update the entry to time cache', function () {
    return timeCacheInterfaceModule.updateEntryToTimeCache().should.become()
  })

  it('Checking to see if cache needs to be flushed', function () {
    return timeCacheInterfaceModule.doesCacheTimeNeedFlush().should.become()
  })

  it('Flushing the time cache', function () {
    return timeCacheInterfaceModule.flushTimeCache().should.become()
  })

  it('Checking to see if the primary entry exists', function () {
    return timeCacheInterfaceModule.hasPrimaryEntry().should.become()
  })
})
