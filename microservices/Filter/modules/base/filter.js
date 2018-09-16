'use strict'

/*
* @Desc: This Module pulls together all of the Filter submodules and
*     acts as an interface to using the Filter Library
* @Author: Ben Smith
* @Date: Sept 16th, 2018
*/

const FilterLoader = require('./lib/filterLoader/moduleLoader.js')
const Configuration = require('./lib/configuration/FilterConfig.js')

// 'Private' variables
const _logger = Symbol('logger')
const _jsonObj = Symbol('jsonObj')
const _configuration = Symbol('Configuration')
const _filterLoader = Symbol('FilterLoader')
const _moduleInstName = Symbol('jsonObj')
const _moduleType = Symbol('jsonObj')

class Filter {
  constructor (logger, jsonObj) {
    // Loads the logger
    this[_logger] = logger

    // Loads the JSONObj
    this[_jsonObj] = jsonObj

    // Creates a new Javascript class loader instance
    this[_filterLoader] = new FilterLoader(logger)

    // Creates a new configuration class instance
    this[_configuration] = new Configuration(logger, jsonObj)
  }

  /*
  * Desc:
  *   This method initializes the configuration object and the module loader object
  * Args:
  *   N/A
  * Throws:
  *   Error - An Error is raised if the configuration .loadConfigurations methods fails
  *   Error - An Error is raised if the Module loader can't be initialized
  *   Error - An Error is raised if the Module that is being instantiated fails its own
  *           initialization.
  */
  async loadConfigurations () {
    // Configuration for the Filter microservice is loaded
    await this[_configuration].loadConfigurations()

    // Get the type of module that this Filter needs
    this[_moduleType] = this[_configuration].typeOfModule

    // In this case the name is the same as the module type
    this[_moduleInstName] = this[_configuration].typeOfModule

    // This is looking for the types of modules which will always be filters in a filter microservice
    await this[_filterLoader].initializeModuleLoader('filters')

    // Creates a module with the name, moduleType, and the configuration that the module needs
    await this[_filterLoader].createModule(this[_logger], this[_moduleInstName], this[_moduleType], this[_configuration].shouldThrowError)
  }

  /*
  * Desc:
  *   This method processes the payload that is passed in using the filter rules it was configured with
  * Args:
  *   jsonObj - Object - The payload Object
  * Throws:
  *   Error - If anything is invalid about the payload an error will be thrown by the filter module
  */
  async process (payload) {
    // For each filterRule that the Filter has been configured with, process the paylaod using the configured module
    for (const filterRule of this[_configuration].filterRules) {
      await this[_filterLoader][this[_moduleInstName]].processPayload(payload, filterRule['key'], filterRule['pathToKey'], filterRule['typeOfMatch'], filterRule['acceptedValues'])
    }

    // After all the filter rules should this payload be filtered
    return this[_filterLoader][this[_moduleInstName]].isJSONObjFiltered
  }
}

module.exports = Filter
