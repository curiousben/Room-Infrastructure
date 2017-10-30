const redisMQ =  require('redisMQ')
const FilterLibrary = require('../lib/Filter_Lib.js')
const redisMQConfig = '/etc/opt/BLERelay/redisMQ.config'
const loggerConfig = '/etc/opt/BLERelay/logger.config'
const FilterConfig = '/etc/opt/BLERelay/Filter.config'

// Example payload
/*
 * {
 *   "device": {
 *     "uuid": "",
 *     "rssi": ""
 *   },
 *   "node": {
 *     "name": ""
 *   }
 * }
 *
*/
// Starting the subscriber
