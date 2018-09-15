/*
*
*
*
*/

const FilterConfig = require('../../lib/configuration/FilterConfig.js')
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

  it('Testing positive cases for configuration', async function () {

    const jsonObj = {
        "shouldThrowError": false,
        "typeOfModule": "JSON",
        "filterRules": [
          {
            "key":"testKey1",
            "pathToKey": ["path1","to1","key1"],
            "typeOfMatch": "exactMatch1",
            "acceptedValues": ["Value11", "Value21"]
          },
          {
            "key":"testKey2",
            "pathToKey": ["path2","to2","key2"],
            "typeOfMatch": "exactMatch2",
            "acceptedValues": ["Value12", "Value22"]
          },
          {
            "key":"testKey3",
            "pathToKey": ["path3","to3","key3"],
            "typeOfMatch": "exactMatch3",
            "acceptedValues": ["Value13", "Value23"]
          }
        ]
    }

    const FilterConfigInst = new FilterConfig(logger, jsonObj)
    try {
      await FilterConfigInst.loadConfigurations()
      FilterConfigInst.filterRules.should.deep.equal(jsonObj['filterRules'])
      FilterConfigInst.shouldThrowError.should.equal(jsonObj['shouldThrowError'])
      FilterConfigInst.typeOfModule.should.equal(jsonObj['typeOfModule'])
    } catch (err) {
      throw err
    }
  })
})
