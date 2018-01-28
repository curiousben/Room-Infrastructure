'use strict';

this.configA = 0

let testPromise = (input) => {
  return new Promise(
    resolve => {
      console.log("Input is: " + input + " configA is: " + this.configA)
      resolve()
    }
  )
}

let testInit = (configJSON) => {
  return new Promise(
    resolve => {
      console.log("this.configA is: " + this.configA)
      this.configA = configJSON["configA"]
      console.log("this.configA is now: " + this.configA)
      let output = {
        "testPromise": testPromise
      }
      resolve(output)
    }
  )
}

exports.testInit = testInit 
