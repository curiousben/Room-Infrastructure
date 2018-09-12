'use strict'

/*
*
*
*
*
*
*/

import FilterLoader = require('./filterLoader/moduleLoader.js')
import Configuration = require('./configuration/FilterConfig.js')

// 'Private' variables 
const  = Symbol('')

// 'Private' variables 
const _logger = Symbol('logger')
const _jsonObj = Symbol('jsonObj')

class Filter {

  constructor(logger, jsonObj) {
    // Loads the logger
    this[_logger] = logger

    // Loads the JSONObj
    this[_jsonObj] = jsonObj

    // Creates a new Javascript class loader instance
    this[_filterLoader] = new FilterLoader(logger)

    // Creates a new configuration class instance
    this[_configuration] = new Configuration(logger, jsonObj)
  }

  async loadConfigurations(){
    await this[_configuration].loadConfigurations()
    const typeOfModule = this[_configuration].typeOfModule
    await this[_filterLoader].createModuleLoader(typeOfModule)
  }

  async process(payload) {

  }
}
