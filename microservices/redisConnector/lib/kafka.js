/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
const Kafka = require('node-rdkafka');
const jsonfile = require('jsonfile');
var configData = null;

var KafkaInit = function (filePath) {
	jsonfile.readFile(filePath, function(err, fileobj){
		if (err != null){
			console.error('Failed to load the config file for the producer. Details:\n\t' + err);
			process.exit(1);
		}
		configData = fileobj;
	});
};

var addProducer = function (logger, configKey){
	
	if (configData === null) {
		logger.error('Kafka client has not loaded its config file');
		process.exit(1);
	}

	if (!(configData.hasOwnProperty(configKey))) {
		logger.error('The Key: ' + configKey + ' is not in the loaded config file');
		process.exit(1);
	}

	try {
		var producer = new Kafka.Producer(configData[configKey]);
		logger.info('Producer is connecting to the Kafka broker');
		
		producer.connect();
		producer.getMetaData(opt, function (err, metaData) {
			if (err != null) {
				logger.error('Failed to query metaData');
				process.exit(1);
			} else {
			logger.info('Producer is successfully connected to the' + metaData.orig_broker_name + 'Kafka broker');
			}
		});
		
		producer.on('event.error', function(err) {
			logger.error('Producer encountered an error. Details\n\t'+err);
		});
		
		producer.on('ready', function() {
			logger.info('Producer is ready to publish messages.');
			return producer;
		});
	} catch (err) {
		console.log('Failed to instantiate the producer. Details:\n\t' + err);
		process.exit(1);
	}
}

var addConsumer = function (logger, configKey){
	if (configData === null) {
		logger.error('Kafka client hs not loaded its config file');
		process.exit(1);
	}

	if (!(configData.hasOwnProperty(configKey))) {
		logger.error('The Key: ' + configKey + ' is not in the loaded config file');
		process.exit(1);
	}

	try {
		var consumer = new Kafka.Consumer(configData[config],{});
		logger.info('Consumer is connecting to the Kafka broker');
		
		consumer.connect();
		consumer.getMetaData(opt, function (err, metaData) {
			if (err != null) {
				logger.error('Failed to query metaData');
				process.exit(1);
			} else {
			logger.info('Consumer is successfully connected to the' + metaData.orig_broker_name + 'Kafka broker');
			}
		});

		consumer.on('event.error', function(err) {
			logger.error('Consumer encountered an error. Details\n\t'+err);
		});

		consumer.on('ready', function() {
			consumer.subscribe([configData[config]['Topic']]);
			consumer.consume();
			logger.info('Consumer is ready to consume messages. On topic '+ configData[config]['Topic'] +'.');
			return consumer;
		});
	} catch (err) {
		console.log('Failed to instantiate the consumer. Details:\n\t' + err);
		process.exit(1);
	}
}

module.exports = KafkaInit;
module.exports.config = configData;
module.exports.addProducer = addProducer;
module.exports.addConsumer = addConsumer;
