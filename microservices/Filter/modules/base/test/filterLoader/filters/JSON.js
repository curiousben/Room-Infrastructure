/*
* This moduels tests the JSON Filter Module
*   directly.
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

describe('JSON Filter Module testing ...', function () {
  context('Testing Positive cases for the JSON Filter Module ...', function () {
    it('Filtered out cases that shouldn\'t throw an error', async function () {
      const filterRules = [
        {
          'key': 'testKey1',
          'pathToKey': ['test1', 'test1', 'test1'],
          'typeOfMatch': 'notExactString',
          'acceptedValues': ['Value11', 'Value12']
        },
        {
          'key': 'testKey2',
          'pathToKey': ['test2', 'test2', 'test2'],
          'typeOfMatch': 'greaterThan',
          'acceptedValues': [22]
        },
        {
          'key': 'testKey3',
          'pathToKey': ['test3', 'test3', 'test3'],
          'typeOfMatch': 'lessThan',
          'acceptedValues': [32]
        }
      ]
      const shouldThrowError = false

      const payloadOne = {
        'test1': {
          'test1': {
            'test1': 'Value31'
          }
        },
        'test2': {
          'test2': {
            'test2': 42
          }
        },
        'test3': {
          'test3': {
            'test3': 24
          }
        }
      }

      const payloadTwo = {
        'test1': {
          'test1': {
            'test1': 'Value12'
          }
        },
        'test2': {
          'test2': {
            'test2': 42
          }
        },
        'test3': {
          'test3': {
            'test3': 42
          }
        }
      }

      const JSONFilterInst = new JSONFilter(logger, shouldThrowError)
      try {
        for (const filterRule of filterRules) {
          await JSONFilterInst.processPayload(payloadOne, filterRule['key'], filterRule['pathToKey'], filterRule['typeOfMatch'], filterRule['acceptedValues'])
        }
        JSONFilterInst.isJSONObjFiltered.should.equal(true)

        for (const filterRule of filterRules) {
          await JSONFilterInst.processPayload(payloadTwo, filterRule['key'], filterRule['pathToKey'], filterRule['typeOfMatch'], filterRule['acceptedValues'])
        }
        JSONFilterInst.isJSONObjFiltered.should.equal(true)
      } catch (err) {
        throw err
      }
    })

    it('Non-Filtered out cases that shouldn\'t throw an error', async function () {
      const filterRules = [
        {
          'key': 'testKey1',
          'pathToKey': ['test1', 'test1', 'test1'],
          'typeOfMatch': 'notExactString',
          'acceptedValues': ['Value123', 'Value', 'Value12', 'Value5678', 'Value00000']
        },
        {
          'key': 'testKey2',
          'pathToKey': ['test2', 'test2', 'test2'],
          'typeOfMatch': 'greaterThan',
          'acceptedValues': [22]
        },
        {
          'key': 'testKey3',
          'pathToKey': ['test3', 'test3', 'test3'],
          'typeOfMatch': 'lessThan',
          'acceptedValues': [32]
        }
      ]

      const payloadOne = {
        'test1': {
          'test1': {
            'test1': 'Value12'
          }
        },
        'test2': {
          'test2': {
            'test2': 11
          }
        },
        'test3': {
          'test3': {
            'test3': 42
          }
        }
      }
      const shouldThrowError = false

      const JSONFilterInst = new JSONFilter(logger, shouldThrowError)
      try {
        for (const filterRule of filterRules) {
          await JSONFilterInst.processPayload(payloadOne, filterRule['key'], filterRule['pathToKey'], filterRule['typeOfMatch'], filterRule['acceptedValues'])
        }
        JSONFilterInst.isJSONObjFiltered.should.equal(false)
      } catch (err) {
        throw err
      }
    })
  })

  context('Testing Negative cases for the JSON Filter Module ...', function () {
    it('Incomplete path to data', async function () {
      const filterRules = [
        {
          'key': 'testKey1',
          'pathToKey': ['test1', 'test2', 'test3'],
          'typeOfMatch': 'exactString',
          'acceptedValues': ['Value11']
        }
      ]

      const payloadOne = {
        'test1': {
          'test2': {
            'test4': 'Value12'
          }
        }
      }

      const shouldThrowError = false

      try {
        const JSONFilterInst = new JSONFilter(logger, shouldThrowError)

        for (const filterRule of filterRules) {
          await JSONFilterInst.processPayload(payloadOne, filterRule['key'], filterRule['pathToKey'], filterRule['typeOfMatch'], filterRule['acceptedValues'])
        }
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal("The key 'test3' does not exist at the path 'test1 -> test2 -> test3' in the payload")
      }
    })

    it('Should throw an error if Filtered out', async function () {
      const filterRules = [
        {
          'key': 'testKey1',
          'pathToKey': ['test1', 'test1', 'test1'],
          'typeOfMatch': 'notExactString',
          'acceptedValues': ['Value11', 'Value12']
        },
        {
          'key': 'testKey2',
          'pathToKey': ['test2', 'test2', 'test2'],
          'typeOfMatch': 'greaterThan',
          'acceptedValues': [22]
        },
        {
          'key': 'testKey3',
          'pathToKey': ['test3', 'test3', 'test3'],
          'typeOfMatch': 'lessThan',
          'acceptedValues': [32]
        }
      ]

      const payloadOne = {
        'test1': {
          'test1': {
            'test1': 'Value31'
          }
        },
        'test2': {
          'test2': {
            'test2': 42
          }
        },
        'test3': {
          'test3': {
            'test3': 24
          }
        }
      }

      const shouldThrowError = true

      try {
        const JSONFilterInst = new JSONFilter(logger, shouldThrowError)

        for (const filterRule of filterRules) {
          await JSONFilterInst.processPayload(payloadOne, filterRule['key'], filterRule['pathToKey'], filterRule['typeOfMatch'], filterRule['acceptedValues'])
        }
        JSONFilterInst.isJSONObjFiltered.should.equal(true)
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal("The data was filtered out due to the following failed filtering rules: The value 'Value31' that was encountered for the key 'testKey1' at the location 'test1 -> test1 -> test1' was a match when the only accepted value(s) is/are 'Value11, Value12',The value '42' that was encountered for the key 'testKey2' at the location in the data 'test2 -> test2 -> test2' was not greater than the accepted value '22',The value '24' that was encountered for the key 'testKey3' at the location in the data 'test3 -> test3 -> test3' was not less than the accepted value '32'")
      }
    })
  })
})
