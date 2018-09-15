/*
*
*
*
*/

const JSONFilter = require('../../../lib/filterLoader/filters/JSON.js')
const winston = require('winston')
var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})
require('chai').should()

describe('Configuration Module testing ...', function () {
  beforeEach(function () {
    // runs before each test in this block
  })

  it('Testing filtered out cases for JSON Filtering that shouldn\'t throw an error', async function () {

    const filterRules = [
      {
        "key":"testKey1",
        "pathToKey": ["test1","test1","test1"],
        "typeOfMatch": "exactString",
        "acceptedValues": ["Value11"]
      },
      {
        "key":"testKey2",
        "pathToKey": ["test2","test2","test2"],
        "typeOfMatch": "greaterThan",
        "acceptedValues": [22]
      },
      {
        "key":"testKey3",
        "pathToKey": ["test3","test3","test3"],
        "typeOfMatch": "lessThan",
        "acceptedValues": [32]
      }
    ]
    const shouldThrowError = false

    const payloadTwo = {
      "test1":{
        "test1": {
          "test1": "Value21"
        }
      },
      "test2": {
        "test2": {
          "test2": 42
        }
      },
      "test3": {
        "test3": {
          "test3": 42
        }
      }
    }

    const payloadOne = {
      "test1":{
        "test1": {
          "test1": "Value11"
        }
      },
      "test2": {
        "test2": {
          "test2": 42
        }
      },
      "test3": {
        "test3": {
          "test3": 24
        }
      }
    }

    const JSONFilterInst = new JSONFilter(logger, shouldThrowError)
    try {

      for (filterRule of filterRules) {
        await JSONFilterInst.processPayload(payloadOne, filterRule['key'], filterRule['pathToKey'], filterRule['typeOfMatch'], filterRule['acceptedValues'])
      }
      JSONFilterInst.isJSONObjFiltered.should.equal(true)

      for (filterRule of filterRules) {
        await JSONFilterInst.processPayload(payloadTwo, filterRule['key'], filterRule['pathToKey'], filterRule['typeOfMatch'], filterRule['acceptedValues'])
      }
      JSONFilterInst.isJSONObjFiltered.should.equal(true)

    } catch (err) {
      throw err
    }
  })

  it('Testing non-filtered out cases for JSON Filtering that shouldn\'t throw an error', async function () {

    const filterRules = [
      {
        "key":"testKey1",
        "pathToKey": ["test1","test1","test1"],
        "typeOfMatch": "exactString",
        "acceptedValues": ["Value11"]
      },
      {
        "key":"testKey2",
        "pathToKey": ["test2","test2","test2"],
        "typeOfMatch": "greaterThan",
        "acceptedValues": [22]
      },
      {
        "key":"testKey3",
        "pathToKey": ["test3","test3","test3"],
        "typeOfMatch": "lessThan",
        "acceptedValues": [32]
      }
    ]
    const shouldThrowError = false

    const payloadTwo = {
      "test1":{
        "test1": {
          "test1": "Value12"
        }
      },
      "test2": {
        "test2": {
          "test2": 11
        }
      },
      "test3": {
        "test3": {
          "test3": 42
        }
      }
    }

    const payloadOne = {
      "test1":{
        "test1": {
          "test1": "Value21"
        }
      },
      "test2": {
        "test2": {
          "test2": 42
        }
      },
      "test3": {
        "test3": {
          "test3": 42
        }
      }
    }

    const JSONFilterInst = new JSONFilter(logger, shouldThrowError)
    try {

      for (filterRule of filterRules) {
        await JSONFilterInst.processPayload(payloadTwo, filterRule['key'], filterRule['pathToKey'], filterRule['typeOfMatch'], filterRule['acceptedValues'])
      }
      JSONFilterInst.isJSONObjFiltered.should.equal(false)

    } catch (err) {
      throw err
    }
  })
})
