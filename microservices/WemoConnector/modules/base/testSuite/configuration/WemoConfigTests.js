'use strict'

const chai = require('chai')
const expect = chai.expect

const configModule = require('../../lib/configuration/WemoConfig.js')

const config = {
  "deviceHandlers":[
    {
      "friendlyName": "AFriendlyName",
      "handlerType": "WemoSwitch",
      "retryTimes": 3
    }
  ],
  "discoveryIntervalSec": 30,
  "refreshIntervalSec": 30
}

const configModuleTest = new configModule(config)
