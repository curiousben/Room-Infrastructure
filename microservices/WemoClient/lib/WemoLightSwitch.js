/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/

"use strict";

const wemoClient= require('wemo-client')
let wemo = new wemoClient()

let discoverLightSwitch = logger => {
  return new Promise (
    resolve => {
      
    }
  )
}

module.exports = {
  discoverLightSwitch: discoverLightSwitch 
}
