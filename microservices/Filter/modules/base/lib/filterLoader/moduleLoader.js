'use strict'

/*
 * @Desc: his module creates a factory where new handler instances can be created
 *   with no need to pass in configuration from outside of the module.
 * @Author: Ben Smith
 * @Date: Sept 15th, 2018
*/

// Import modules
const util = require('util')
const fs = require('fs')
const readDir = util.promisify(fs.readdir)

// Import private variabes
const _typeOfModules = Symbol('typeOfModules')
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
  async [_getJSModuleFiles] (moduleDir) {
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
  async initializeModuleLoader (typeOfModules) {
    // Sets the what kind of modules are being loaded and where
    this[_typeOfModules] = typeOfModules

    // Resolves to the directory where the modules are
    const moduleDir = `${__dirname}/${this[_typeOfModules]}/`

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
  *   This method initializes a particular module and creates a new instance of it.
  *     Now the modules own unique methods can be exposed to outside of the
  *     module loader.
  * Params:
  *   logger (Logger) - Winston logger that is passed in
  *   moduleInstName (String) - Name of the key where the new instance will be stored
  *   moduleType (String) - The name of the type of module that will be loaded to the
  *                         module loader.
  *   configObj (String) - The config object that is past to the constructor of each
  *                        module.
  * Throws:
  *   Error - If the type of module doesn't exist
  *   Error - If the name of the module instance has already been established
  */
  createModule (logger, moduleInstName, moduleType, configObj) {
    // Checking to see if the requested moduleType exists
    if (!(moduleType in this[_moduleHashMap])) {
      const errorDesc = `The module type ${module} does not exist in the module loader`
      this[_logger].error(errorDesc)
      throw new Error(errorDesc)
    }

    // Checking to see if the requested module intance name already exists
    if (moduleInstName in this) {
      const errorDesc = `The module instance ${moduleInstName} already exists in the module loader`
      this[_logger].error(errorDesc)
      throw new Error(errorDesc)
    }

    // Creates a new instance of a module
    this[moduleInstName] = new this[_moduleHashMap][moduleType](logger, configObj)
  }
}

module.exports = ModuleLoader
