/*
* This are the tests for the configuration
*   class for the Filter microservice
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

  context('Testing Positive cases for the Configuration Filter Module ...', function () {
    it('Full statndard configuration', async function () {
      const jsonObj = {
        'shouldThrowError': false,
        'typeOfModule': 'JSON',
        'filterRules': [
          {
            'key': 'testKey1',
            'pathToKey': ['path1', 'to1', 'key1'],
            'typeOfMatch': 'exactMatch1',
            'acceptedValues': ['Value11', 'Value21']
          },
          {
            'key': 'testKey2',
            'pathToKey': ['path2', 'to2', 'key2'],
            'typeOfMatch': 'exactMatch2',
            'acceptedValues': ['Value12', 'Value22']
          },
          {
            'key': 'testKey3',
            'pathToKey': ['path3', 'to3', 'key3'],
            'typeOfMatch': 'exactMatch3',
            'acceptedValues': ['Value13', 'Value23']
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

  context('Testing Negative cases for the Configuration Filter Module ...', function () {
    it('Incorrect typeOfModule Configuration', async function () {
      const jsonObj = {
        'shouldThrowError': false,
        'typeOfModule': 42,
        'filterRules': [
          {
            'key': 'testKey1',
            'pathToKey': ['path1', 'to1', 'key1'],
            'typeOfMatch': 'exactMatch1',
            'acceptedValues': ['Value11', 'Value21']
          }
        ]
      }

      const FilterConfigInst = new FilterConfig(logger, jsonObj)
      try {
        await FilterConfigInst.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal("The module type encountered '42' is not a string. The Module type configuration can only be String.")
      }
    })

    it('Incorrect shouldThrowError Configuration', async function () {
      const jsonObj = {
        'shouldThrowError': 'Wrong',
        'typeOfModule': 'JSON',
        'filterRules': [
          {
            'key': 'testKey1',
            'pathToKey': ['path1', 'to1', 'key1'],
            'typeOfMatch': 'exactMatch1',
            'acceptedValues': ['Value11', 'Value21']
          }
        ]
      }

      const FilterConfigInst = new FilterConfig(logger, jsonObj)
      try {
        await FilterConfigInst.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal("The main Filter configuration has encountered 'Wrong' for the throwsError. ThrowsError can only be a Boolean.")
      }
    })

    it('Missing a Filter Rule', async function () {
      const jsonObj = {
        'shouldThrowError': false,
        'typeOfModule': 'JSON',
        'filterRules': [
          {
            'key': 'testKey1',
            'typeOfMatch': 'exactMatch1',
            'acceptedValues': ['Value11', 'Value21']
          }
        ]
      }

      const FilterConfigInst = new FilterConfig(logger, jsonObj)
      try {
        await FilterConfigInst.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal(`Filter configuration is missing either 'key', 'acceptedValues', 'pathToKey', 'typeOfMatch', or 'throwsError' for the filtered data ${jsonObj['filterRules'][0]}.`)
      }
    })

    it('Incorrect key type in a Filter Rule', async function () {
      const jsonObj = {
        'shouldThrowError': false,
        'typeOfModule': 'JSON',
        'filterRules': [
          {
            'key': 42,
            'pathToKey': ['path1', 'to1', 'key1'],
            'typeOfMatch': 'exactMatch1',
            'acceptedValues': ['Value11', 'Value21']
          }
        ]
      }

      const FilterConfigInst = new FilterConfig(logger, jsonObj)
      try {
        await FilterConfigInst.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal("A Filter rule for the key '42' is not a string. The Key configuration can only be String.")
      }
    })

    it('Incorrect acceptedValues type a Filter Rule', async function () {
      const jsonObj = {
        'shouldThrowError': false,
        'typeOfModule': 'JSON',
        'filterRules': [
          {
            'key': 'testKey1',
            'pathToKey': ['path1', 'to1', 'key1'],
            'typeOfMatch': 'exactMatch1',
            'acceptedValues': 'WrongAcceptedValues'
          }
        ]
      }

      const FilterConfigInst = new FilterConfig(logger, jsonObj)
      try {
        await FilterConfigInst.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal("A Filter rule for the key 'testKey1' has encountered 'WrongAcceptedValues' for the acceptedValues. AcceptedValues can only be an Array.")
      }
    })

    it('Incorrect pathToKey type in a Filter Rule', async function () {
      const jsonObj = {
        'shouldThrowError': false,
        'typeOfModule': 'JSON',
        'filterRules': [
          {
            'key': 'testKey1',
            'pathToKey': 'WrongPathToKey',
            'typeOfMatch': 'exactMatch1',
            'acceptedValues': ['Value11', 'Value21']
          }
        ]
      }

      const FilterConfigInst = new FilterConfig(logger, jsonObj)
      try {
        await FilterConfigInst.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal("A Filter rule for the key 'testKey1' has encountered 'WrongPathToKey' for the pathToKey. PathToKey can only be an Array.")
      }
    })

    it('Incorrect typeOfMatch type in a Filter Rule', async function () {
      const jsonObj = {
        'shouldThrowError': false,
        'typeOfModule': 'JSON',
        'filterRules': [
          {
            'key': 'testKey1',
            'pathToKey': ['path1', 'to1', 'key1'],
            'typeOfMatch': 42,
            'acceptedValues': ['Value11', 'Value21']
          }
        ]
      }

      const FilterConfigInst = new FilterConfig(logger, jsonObj)
      try {
        await FilterConfigInst.loadConfigurations()
      } catch (err) {
        err.should.be.a('Error')
        err.message.should.equal("A Filter rule for the key 'testKey1' has encountered '42' for the typeOfMatch .TypeOfMatch can only be a String.")
      }
    })
  })
})
