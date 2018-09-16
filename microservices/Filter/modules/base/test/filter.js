/*
* This is a module for tests for the filter Module
*   how a developer can use the Filter library will
*   follow the spirit of how this module tested the
*   Filter Module
*/

const Filter = require('../filter.js')
const winston = require('winston')
var logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})
require('chai').should()

describe('Filter Module testing ...', function () {
  beforeEach(function () {
    // runs before each test in this block
  })

  context('Testing Positive cases for the Filter Module ...', function () {
    it('Basic Filtering out of data', async function () {
      const jsonObj = {
        'shouldThrowError': false,
        'typeOfModule': 'JSON',
        'filterRules': [
          {
            'key': 'testKey1',
            'pathToKey': ['test1', 'test1', 'test1'],
            'typeOfMatch': 'exactString',
            'acceptedValues': ['Value11']
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
      }

      const payloadOne = {
        'test1': {
          'test1': {
            'test1': 'Value11'
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
            'test1': 'Value21'
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

      const FilterInst = new Filter(logger, jsonObj)
      try {
        await FilterInst.loadConfigurations()
        const shouldFilterOne = await FilterInst.process(payloadOne)
        shouldFilterOne.should.equal(true)
        const shouldFilterTwo = await FilterInst.process(payloadTwo)
        shouldFilterTwo.should.equal(true)
      } catch (err) {
        throw err
      }
    })

    it('Basic Non-Filtering out of data', async function () {
      const jsonObj = {
        'shouldThrowError': false,
        'typeOfModule': 'JSON',
        'filterRules': [
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
      }

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

      const FilterInst = new Filter(logger, jsonObj)
      try {
        await FilterInst.loadConfigurations()
        const shouldFilterOne = await FilterInst.process(payloadOne)
        shouldFilterOne.should.equal(false)
      } catch (err) {
        throw err
      }
    })
  })

  context('Testing Negative cases for the Filter Module ...', function () {
    it('Should throw an error if Filtered out', async function () {
      const jsonObj = {
        'shouldThrowError': true,
        'typeOfModule': 'JSON',
        'filterRules': [
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
      }

      let FilterInst = null
      try {
        FilterInst = new Filter(logger, jsonObj)
        await FilterInst.loadConfigurations()
      } catch (err) {
        throw err
      }

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

      try {
        const shouldFilterOne = await FilterInst.process(payloadOne)
        shouldFilterOne.should.equal(true)
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal("The data was filtered out due to the following failed filtering rules: The value 'Value31' that was encountered for the key 'testKey1' at the location 'test1 -> test1 -> test1' was a match when the only accepted value(s) is/are 'Value11, Value12',The value '42' that was encountered for the key 'testKey2' at the location in the data 'test2 -> test2 -> test2' was not greater than the accepted value '22',The value '24' that was encountered for the key 'testKey3' at the location in the data 'test3 -> test3 -> test3' was not less than the accepted value '32'")
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

      try {
        const shouldFilterTwo = await FilterInst.process(payloadTwo)
        shouldFilterTwo.should.equal(true)
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal("The data was filtered out due to the following failed filtering rules: The value '42' that was encountered for the key 'testKey2' at the location in the data 'test2 -> test2 -> test2' was not greater than the accepted value '22'")
      }
    })
  })
})
