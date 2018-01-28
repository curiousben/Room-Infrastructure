/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/

let utils = require('./utilities/initialize.js')
let aggregatorErrors = require('./errors/aggregatorError.js')
let 

/*
* Description:
*   
* Args:
*   
* Returns:
*   
* Throws:
*   
* Notes:
*   N/A
* TODO:
*   [#1]:
*/

let createAggregator = (logger, configJSON) => {
  return new Promise(
    resolve => {
      let validConfig = utils.initAggregator(configJSON)
      
    }
  )
}

exports.createAggregator = (loggerParam, configJSONParam) => {
  return new createAggregator(loggerParam, configJSONParam)
}
