const secondaryCacheInterfaceModule = require('lib/cache/cacheInterface/secondaryCache.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the secondary Cache Interface module', function () {
  let cacheInstance = null
  before(function () {
    cacheInstance.cache = null
    cacheInstance.config = {}
    cacheInstance.properties = {}
  })

  it('Creating a Primary entry in Cache', function () {
    return secondaryCacheInterfaceModule.addEntryToPrimaryCache().should.become()
  })

  it('Create a Secondary Entry in cache', function () {
    return secondaryCacheInterfaceModule.addEntryToSecondCache().should.become()
  })

  it('Update secondary entry in cache', function () {
    return secondaryCacheInterfaceModule.updateEntryToSecondCache().should.become()
  })

  it('Checking if cache needs to be flushed', function () {
    return secondaryCacheInterfaceModule.doesCacheSecondaryNeedFlush().should.become()
  })
  it('Flush secondary cache', function () {
    return secondaryCacheInterfaceModule.flushSecondaryEventCache().should.become()
  })
  it('Checking if Primary Entry exists', function () {
    return secondaryCacheInterfaceModule.hasPrimaryEntry().should.become()
  })
  it('Checking if Secondary Entry exist', function () {
    return secondaryCacheInterfaceModule.hasSecondaryEntry().should.become()
  })
})
