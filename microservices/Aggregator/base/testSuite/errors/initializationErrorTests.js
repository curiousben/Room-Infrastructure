let AggregatorInitializationError = require("../../lib/errors/initializationError.js")
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

let expect = chai.expect

let initializationErrorThrow = () => {
  return new Promise(
    resolve => {
      throw new initializationError("Test initializationError")
    }
  )
  .catch(error => {
    throw error
  })
}

return expect(initializationErrorThrow).to.throw(AggregatorInitializationError)
