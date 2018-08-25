'use strict'

/*
*
* 
*
*/

const handleLoader = require("../../lib/handlerLoader/handlerLoader.js")
const winston = require('winston')
const logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)()
  ]
})
const should = require('chai').should()

describe('Handler Loader Module testing ...', function() {

  let handleLoaderObj = null

  beforeEach(function() {
    handleLoaderObj = null    
  })

  it('Postive testing of Class loader', async function () {

    handleLoaderObj = new handleLoader(logger)
    try {
      await handleLoaderObj.createHandlerLoader()
    } catch (err) {
      logger.error(`Encountered error ${err.message}`)
      throw err
    }
    
    const TestModuleOneConfig = {
      "var1": 1,
      "var2": 2
    }

    const TestModuleTwoConfig = {
      "var3": 3,
      "var4": 4
    }

    const TestModuleOneObj = handleLoaderObj.getHandler('TestModuleOne')(logger, TestModuleOneConfig)
    TestModuleOneObj.getVarOne.should.be.equal(1)
    TestModuleOneObj.getVarTwo.should.be.equal(2)
    TestModuleOneObj.add().should.be.equal(3)

    const TestModuleTwoObj = handleLoaderObj.getHandler('TestModuleTwo')(logger, TestModuleTwoConfig)
    TestModuleTwoObj.getVarThree.should.be.equal(3)
    TestModuleTwoObj.getVarFour.should.be.equal(4)
    TestModuleTwoObj.multi().should.be.equal(12)
  })
})
