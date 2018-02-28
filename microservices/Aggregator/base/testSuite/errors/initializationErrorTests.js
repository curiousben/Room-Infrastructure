let initializationError = require("../../lib/errors/initializationError.js")
let chai = require("chai");
let chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

chai.should();

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

describe("InitializationError", function(){
  it("repond with a throw error", function() {
    return initializationErrorThrow().should.be.rejectedWith(initializationError)
  })
})
