'use strict'

/*
 *
 * This module creates a factory where new handler instances can be created
 *   with no need to pass in configuration from outside of the module.
 *
*/

// Import modules
const util = require('util')
const fs = require('fs')
const readDir = util.promisify(fs.readdir)

// Import private variabes
const _moduleHashMap = Symbol('handlerHashmap')
const _logger = Symbol('logger')

// Import private methods
const _getJSModuleFiles = Symbol('getJavascriptClasses')

class ModuleLoader {
  constructor (logger) {
    this[_moduleHashMap] = {}
    this[_logger] = logger
  }

  /*
  * |======== PRIVATE ========|
  *
  * Desc:
  *   This method gathers the names of the JavaScript Class handlers
  * Params:
  *   N/A
  * Throws:
  *   Error - Any execption that might occur while trying to open the handlers directory
  *
  */
  async [_getJSModuleFiles](moduleDir) {
    return readDir(moduleDir)
  }

  /*
  * |======== PUBLIC  ========|
  *
  * Desc:
  *   This method creates a hashmap of loaded handler modules
  * Params:
  *   jsModulesFiles(Array) - Classes found in the handler directory
  * Throws:
  *   Error - Any execption that might occur while trying to create the hashmap of handler instances
  *
  */
  async createModuleLoader (typeOfModules) {
    // Sets the what kind of modules are being loaded and where
    this[_typeOfModules] = typeOfModules

    // Resolves to the directory where the modules are
    const moduleDir = `${__dirname}/${this[_typeOfModules]}`

    // Gets the module Javascript file names
    const jsModulesFiles = await this[_getJSModuleFiles](moduleDir)

    // For each JS file get the file name without '.js'
    // Load that module, then attach it to the moduleHashMap
    jsModulesFiles.forEach(jsModuleFile => {
      const moduleName = jsModuleFile.replace('.js', '')
      const module = require(moduleDir.concat(jsModuleFile))
      this[_moduleHashMap][moduleName] = module
    })
  }

  /*
  * |======== PUBLIC  ========|
  *
  * Desc:
  *   This method gathers the names of the JavaScript Class handlers
  * Params:
  *   module (String) - Type of Wemo Handler
  *   wemoConnection (WemoConnection) - WemoConnection instance
  *   handlerRetryTimes (Integer) - Number of retry attempts for the WemoConnection
  * Throws:
  *   Error - Any execption that might occur while trying to create the hashmap of handler instances
  *
  */
  getModule (logger, module, configObj) {
    if (module in this[_moduleHashMap]) {
      return new this[_moduleHashMap][module](logger, configObj)
    } else {
      throw new Error(`The module type ${module} does not exist in the module loader`)
    }
  }
}

module.exports = ModuleLoader
