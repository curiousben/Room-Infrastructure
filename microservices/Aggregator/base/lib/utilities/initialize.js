/* eslint-env node */
/* eslint no-console:['error', { allow: ['info', 'error'] }] */

/*
* Module design:
*   This module will check to see if the configuration file has the correct fields
*/

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
*   Example:
{
  "cache": {
    "setup": external or internal,
    "storage": {
      "strategy": singleEvent or multiEvent,
      "policy": {
        "archiveBy": secondaryEvent or time,
        "eventLimit": 10,
      },
      "eventTrigger": {
        "primaryEvent": [Path,to,data,in,JSONObj],
        "secondaryEvent": [Path,to,data,in,JSONObj] (Only needed if archiveBy is set to secondaryEvent)
      }
      "byteSizeWatermark": 1000000
    },
    "flushStrategy": single or multi
  }
}
* Throws:
*   AggregatorInitializationError (Error): This error is raised if any configurations are out of place when initializing the Aggregator module
* Notes:
*   The default cache watermark is 25 MB if the passed in value is 0 or null.
* TODO:
*   [#1]:
*/

let initAggregator = (configJSON) => {
  return new Promise(
    resolve => {
      let aggregatorConfig = configJSON['cache']

      // Checking to see if all base keys exist and has the right types
      if (!('setup' in aggregatorConfig) || !('storage' in aggregatorConfig) || !('flushStrategy' in aggregatorConfig)) {
        throw new AggregatorInitializationError('Aggregator configuration is missing either \'setup\', \'data\', \'storage\', or \'flushStrategy\' for the Aggregator configuration.')
      }
      // Setup configuration
      const setupSection = aggregatorConfig['setup']
      if (typeof setupSection !== 'string' && !(setupSection instanceof String)) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + setupSection + '\' for the setup configuration in the Setup section. Only strings are accepted.')
      }
      if (setupSection !== 'internal' || setupSection !== 'external') {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + setupSection + '\' for the setup configuration in the Setup section. Only options \'internal\' and \'external\' are excepted.')
      }

      // Storage configuration
      const storageSection = aggregatorConfig['storage']
      if (!('strategy' in storageSection) || !('policy' in storageSection) || !('eventTrigger' in storageSection) || !('byteSizeWatermark' in storageSection)) {
        throw new AggregatorInitializationError('Aggregator configuration is missing either \'strategy\', \'policy\', \'eventTrigger\', or \'byteSizeWatermark\' for the Storage section in the configuration')
      }

      // Strategy Storage subsection
      const storageStrategy = storageSection['strategy']
      if (typeof storageStrategy !== 'string' && !(storageStrategy instanceof String)) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + storageStrategy + '\' for the strategy configuration in the Storage section. Only strings are accepted.')
      }
      if (storageStrategy !== 'singleEvent' || storageStrategy !== 'multiEvent') {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + storageStrategy + '\' for the strategy configuration in the Storage section. Only options \'singleEvent\' and \'multiEvent\' are excepted.')
      }

      // Policy Storage subsection
      const policySubSection = storageSection['policy']
      if (!('archiveBy' in policySubSection) || !('eventLimit' in policySubSection)) {
        throw new AggregatorInitializationError('Aggregator configuration is missing either \'uniqueData\' or \'eventLimit\' in the Policy subsection of the Data section in the Aggregator configuration')
      }

      const policyArchive = policySubSection['archiveBy']
      if (typeof policyArchive !== 'string' && !(policyArchive instanceof String)) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + policyArchive + '\' for the strategy configuration in the Storage section. Only strings are accepted.')
      }
      if (policyArchive !== 'secondaryEvent' || policyArchive !== 'time') {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + policyArchive + '\' for the strategy configuration in the Storage section. Only options \'secondaryEvent\' and \'time\' are excepted.')
      }

      const policyEventLimit = policySubSection['eventLimit']
      if (typeof policyEventLimit !== 'number' && isFinite(policyEventLimit)) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + policyEventLimit + '\' for the policyEventLimit configuration in the Policy subsection of the Storage section. Only Number values are accepted.')
      }

      // Event Trigger Storage subsection
      const EventTriggerSubSection = storageSection['eventTrigger']
      if (!('primaryEvent' in EventTriggerSubSection) || !('secondaryEvent' in EventTriggerSubSection)) {
        throw new AggregatorInitializationError('Aggregator configuration is missing either \'primaryEvent\' or \'secondaryEvent\' in the EventTrigger subsection of the Storage section in the Aggregator configuration')
      }

      const primaryEvent = EventTriggerSubSection['primaryEvent']
      if (!(Array.isArray(primaryEvent))) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + primaryEvent + '\' for the primaryEvent configuration in the Event Trigger subsection of the Storage section. Only Number values are accepted.')
      }
      const secondaryEvent = EventTriggerSubSection['secondaryEvent']
      if (!(Array.isArray(secondaryEvent))) {
        throw new AggregatorInitializationError('Aggregator configuration has encountered \'' + secondaryEvent + '\' for the secondaryEvent configuration in the Event Trigger subsection of the Storage section. Only Number values are accepted.')
      }

      // Flush Strategy Configuration
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
  initAggregator: initAggregator
}
