'use strict'

/*
*
* This Javascript test "class" handler 
*
*/

// Private Variables for the WemoSwitch class
const _logger = Symbol('logger')
const _testConfig = Symbol('testConfig')

class TestModuleOne extends EventEmitter {

  constructor(logger, configObj) {
    // Load the logger for the handler
    this[_logger] = logger

    // Load the test configuration
    this[_testConfig] = configObj
  }

  get TestModuleOne () {
    return this[_testConfig]['var1']
  }

  get TestModuleTwo () {
    return this[_testConfig]['var2']
  }

  add () {
    return this[_testConfig]['var1'] + this[_testConfig]['var2']
  }
}

module.exports = TestModuleOne
