
'use strict';

function LocalStorageFFSCacheManager(interceptor, encryptor, decryptor, localStorageImpl) {
	this.interceptor = interceptor;
	this.interceptor.registerPreRequest(function(options, config) {
		if (!config.cache) return;
		config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
		let cachedValue = (localStorageImpl || localStorage).getItem(config.key);
		return (typeof options.encryptor === 'function') ? options.decryptor(cachedValue, options) : cachedValue;
	}, {
		decryptor
	});
	
	this.interceptor.registerPreResponse(function(options, config) {
		if (!config.cache) return;
		if (config.response) {
			config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
			let encryptedResponse = (typeof options.encryptor === 'function') ? options.encryptor(config.response, options) : config.response;
			(localStorageImpl || localStorage).setItem(config.key, encryptedResponse);
		}
	}, {
		encryptor
	});
}

module.exports = LocalStorageFFSCacheManager;
