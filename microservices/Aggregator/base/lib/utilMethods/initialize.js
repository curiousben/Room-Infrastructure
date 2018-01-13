/*eslint-env node*/
/*eslint no-console:['error', { allow: ['info', 'error'] }]*/

let AggregatorInitializationError = require('./errors/initializationError.js')

/*
* Description:
*   This promise initializes the Aggregator configuration.
* Args:
*   logger (Logger): This is the logger that is provided by the logger from the consumer.
*   configJSON (Obj): This obj has the configurations for the Aggregator microservice.
* Returns:
*   Aggregator (AggregatorInstance): This AggregatorInstance has a validated configuration and a promise that can be
*     accessed asynchronously that aggregators messages based on those configurations.
* Throws:
*   AggregatorInitializationError (Error): This error is raised if any configurations are out of place when initializing the Aggregator module
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let initAggregator = (configJSON) => {
  return new Promise(
    resolve => {
      let aggregatorConfig = configJSON['cache']

      // Checking to see if all key configuration exist and has the right types
      if (!('setup' in aggregatorConfig) || !('data' in aggregatorConfig) || !('storage' in aggregatorConfig) || !('flushStrategy' in aggregatorConfig)) {
        throw new AggregatorInitializationError('Aggregator configuration is missing either \'setup\', \'data\', \'storage\', or \'flushStrategy\' for the Aggregator configuration.')
      }

      const setupSection = aggregatorConfig['setup']
      if (typeof setupSection  !== 'string' && !(setupSection instanceof String)) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + setupSection + '\' for the setup configuration in the Setup section. Only strings are accepted.')
      }
      if (setupSection !== 'internal' || setupSection !== 'external') {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + setupSection + '\' for the setup configuration in the Setup section. Only options \'internal\' and \'external\' are excepted.')
      }
      
      const dataSection = aggregatorConfig['data']
      if (!('recordLabel' in aggregatorConfig) || !('subRecordLabel' in aggregatorConfig)) {
        throw new AggregatorInitializationError('Aggregator configuration is missing either \'RecordLabel\' or \'SubRecordLabel\' for the Data section in the configuration')
      }
      const dataRecordLabel = dataSection['recordLabel']
      if (typeof dataRecordLabel !== 'object' || dataRecordLabel.constructor !== Array) {
        throw new AggregatorInitializationError('Aggregator configuration has \'' + dataRecordLabel + '\' for the recordLabel configuration in the Data section. Only Arrays are accepted.')
      }
      const dataSubRecordLabel = dataSection['subRecordLabel']
      if (typeof dataRecordLabel !== 'object' || dataRecordLabel.constructor !== Array) {
        throw new AggregatorInitializationError('Aggregator configuration has \'' + dataSubRecordLabel + '\' for the subRecordLabel configuration in the Data section. Only Arrays are accepted.')
      }

      const storageSection = aggregatorConfig['storage']
      if (!('strategy' in storageSection) || !('policy' in storageSection) || !('byteSizeWatermark' in storageSection)) {
        throw new AggregatorInitializationError('Aggregator configuration is missing either \'strategy\', \'policy\', or \'byteSizeWatermark\' for the Storage section in the configuration')
      }
      const storageStrategy = storageSection['strategy']
      if (typeof storageStrategy !== 'string' && !(storageStrategy instanceof String)) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + storageStrategy + '\' for the strategy configuration in the Storage section. Only strings are accepted.')
      }
      if (storageStrategy !== 'uniqueEvent' || storageStrategy !== 'perEvent') {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + storageStrategy + '\' for the strategy configuration in the Storage section. Only options \'uniqueEvent\' and \'perEvent\' are excepted.')
      }
      const policySubSection = storageSection['policy']
      if (!('uniqueData' in policySubSection) || !('eventLimit' in policySubSection)) {
        throw new AggregatorInitializationError('Aggregator configuration is missing either \'uniqueData\' or \'eventLimit\' in the Policy subsection of the Data section in the Aggregator configuration')
      }
      const policyUniqueData = policySubSection['uniqueData']
      if (typeof policyUniqueData !== 'boolean') {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + policyUniqueData + '\' for the uniqueData configuration in the Policy subsection of the Storage section. Only Boolean values are accepted.')
      }
      const policyEventLimit = policySubSection['eventLimit']
      if (typeof policyEventLimit !== 'number' && isFinite(policyEventLimit)) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + policyEventLimit + '\' for the policyEventLimit configuration in the Policy subsection of the Storage section. Only Number values are accepted.')
      }
      const storageByteSizeWatermark = storageSection['byteSizeWatermark']
      if (typeof storageByteSizeWatermark !== 'number' && isFinite(storageByteSizeWatermark)) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + storageByteSizeWatermark + '\' for the storageByteSizeWatermark configuration in the Storage section. Only Number values are accepted.')
      }
        
      const flushStrategySection = aggregatorConfig['flushStrategy']
      if (typeof flushStrategySection !== 'string' && !(flushStrategySection instanceof String)) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + flushStrategySection + '\' for the flushStrategy configuration in the FlushStrategy section. Only strings are accepted.')
      }
      if (flushStrategySection !== 'single' || flushStrategySection !== 'multi') {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + flushStrategySection + '\' for the flushStrategy configuration in the FlushStrategy sonfiguration. Only options \'single\' and \'multi\' are excepted.')
      }
      resolve(aggregatorConfig)
    }
  )
}

module.exports = {
  initAggregator: initAggregator,
}
