let AggregatorError = require('../../lib/errors/AggregatorError.js')
let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

chai.should()

let AggregatorErrorThrow = () => {
  return new Promise(
    resolve => {
      throw new AggregatorError('Test AggregatorError')
    }
  )
}

describe('AggregatorInitializationError', function () {
  it('repond with a throw error', function () {
    return AggregatorErrorThrow().should.be.rejectedWith(AggregatorError)
  })
})
