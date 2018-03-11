const bufferManagementModule = require('../../../../lib/cache/cacheInterface/utilities/bufferManagement.js')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

describe('Testing the buffer management module', function () {
  let jsonObj = null
  let jsonObjString = null
  let jsonObjBuffer = null
  before(function () {
    jsonObj = {
      testKey1: 'testValue1',
      testkey2: {
        testKey1: 'testValue1',
        testKey2: 'testValue2'
      }
    }
    jsonObjString = JSON.stringify(jsonObj)
    jsonObjBuffer = Buffer.from(jsonObjString)
  })
  it('Retreive JSON from buffer', function () {
    return bufferManagementModule.getJSONFromBuffer(jsonObjBuffer).should.become(jsonObj)
  })

  it('Retreive buffer size from String', function () {
    return bufferManagementModule.getSizeOfBufferFromString(jsonObjString).should.become(86)
  })

  it('Retreive buffer size from Buffer', function () {
    return bufferManagementModule.getSizeOfBufferFromBuffer(jsonObjBuffer).should.become(86)
  })

  it('Create buffer from string', function () {
    return bufferManagementModule.createBufferFromString(jsonObjString).should.become(jsonObjBuffer)
  })
})
