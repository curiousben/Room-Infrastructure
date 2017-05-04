const noble = require('noble');

var nobleClient = function (logger) {
	noble.on('stateChange', function (state) {
		if (state === 'poweredOn') {
			noble.startScanning([],true);
			logger.info('BLE service has started scanning');
			return noble;
		} else {
			noble.stopScanning();
			logger.info('BLE service has stopped scanning');
		}
	});
};

module.exports = nobleClient;
