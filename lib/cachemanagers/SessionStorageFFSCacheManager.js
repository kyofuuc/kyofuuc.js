
'use strict';

const utils = require("../utils");
const LocalStorageFFSCacheManager = require('./LocalStorageFFSCacheManager');

function SessionStorageFFSCacheManager(options) {
	let forwardOptions = {};
	if (utils.isObject(options) && forwardOptions.encryptor) {
		forwardOptions.encryptor = options.encryptor;
		forwardOptions.decryptor = options.decryptor;
		forwardOptions.bucket = options.bucket;
	} else {
		forwardOptions.bucket = options;
	}
	forwardOptions.bucket = forwardOptions.bucket || sessionStorage;
	return new LocalStorageFFSCacheManager(options);
}

module.exports = SessionStorageFFSCacheManager;
