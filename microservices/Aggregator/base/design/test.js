'use strict';

var testMod = require("./testMod.js")

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
