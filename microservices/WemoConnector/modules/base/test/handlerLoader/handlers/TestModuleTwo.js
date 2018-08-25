'use strict'

/*
*
* This Javascript test "class" handler 
*
*/

// Private Variables for the WemoSwitch class
const _logger = Symbol('logger')
const _testConfig = Symbol('testConfig')

class TestModuleTwo extends EventEmitter {

  constructor(logger, configObj) {
    // Load the logger for the handler
    this[_logger] = logger

    // Load the test configuration
    this[_testConfig] = configObj
  }

  get TestModuleOne () {
    return this[_testConfig]['var3']
  }

  get TestModuleTwo () {
    return this[_testConfig]['var4']
  }

  add () {
    return this[_testConfig]['var3'] + this[_testConfig]['var4']
  }
}

module.exports = TestModuleTwo
