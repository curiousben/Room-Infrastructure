'use strict';

var testMod = require("./testMod.js")

/*
let config = {
  "configA": 3
}

var configA = 2
Promise.resolve()
  .then(() => testMod.testInit(config))
  .then(testObj => {
    this.configA = 2
    testObj["testPromise"]("PEWPEWPEW")
  })
*/

Promise.resolve()
  .then(() => {
    console.log("TestVar is: " + testMod.testVar)
    return
  })
  .then(() => testMod.init())
  .then(test => {
    console.log("TestVar is: " + testMod.testVar)
    //console.log("TestVar is: " + Object.keys(test))
    return
  })
