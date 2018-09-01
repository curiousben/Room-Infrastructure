'use strict'

/*
*
*
*
*/

const HandleLoader = require('../../lib/handlerLoader/handlerLoader.js')
const winston = require('winston')
const logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)()
  ]
})
require('chai').should()

describe('Handler Loader Module testing ...', function () {
  let handleLoaderObj = null

  beforeEach(function () {
    handleLoaderObj = null
  })

  it('Postive testing of Javascript Class loader', async function () {
    handleLoaderObj = new HandleLoader(logger)
    try {
      await handleLoaderObj.createHandlerLoader()
    } catch (err) {
      logger.error(err)
      throw err
    }

    const TestModuleOneObj = handleLoaderObj.getHandler('TestModule', logger, {}, {}, 3)
    TestModuleOneObj.retryTimes.should.equal(3)
    TestModuleOneObj.addFiveTimestoRetry().should.equal(8)
  })

  it('Negative testing of Javascript Class loader', async function () {
    handleLoaderObj = new HandleLoader(logger)
    try {
      await handleLoaderObj.createHandlerLoader()
    } catch (err) {
      throw err
    }

    const TestModuleConfig = {
      'retryTimes': 3
    }
    try {
      handleLoaderObj.getHandler('NonExistentModule', logger, {}, {}, TestModuleConfig)
    } catch (err) {
      err.should.be.a('Error')
      err.message.should.equal('The device handler type NonExistentModule does not exist in the handler loader')
    }
  })
})
