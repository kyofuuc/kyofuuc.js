
'use strict';

function LocalStorageFFSCacheManager(encryptor, decryptor, localStorageImpl) {
	this.interceptorIds = [];
	this.encryptor = encryptor;
	this.decryptor = decryptor;
	this.localStorageImpl = localStorageImpl;
}

LocalStorageFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
	if (!interceptor) return;
	let localStorageImpl = this.localStorageImpl;
	const preInterceptorId = interceptor.registerPreRequest(function(options, config) {
		if (!config.cache) return;
		config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
		let cachedValue = (localStorageImpl || localStorage).getItem(config.key);
		if (cachedValue && config.refreshCache) localStorage.removeItem(config.key);
		return (typeof options.encryptor === 'function') ? options.decryptor(cachedValue, options) : cachedValue;
	}, {
		decryptor: this.decryptor
	});
	this.interceptorIds.push(preInterceptorId);

	const postInterceptorId = interceptor.registerPreResponse(function(options, config) {
		if (!config.cache) return;
		if (config.response) {
			config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
			let encryptedResponse = (typeof options.encryptor === 'function') ? options.encryptor(config.response, options) : config.response;
			(localStorageImpl || localStorage).setItem(config.key, encryptedResponse);
		}
	}, {
		encryptor: this.encryptor
	});
	this.interceptorIds.push(postInterceptorId);
}

LocalStorageFFSCacheManager.prototype.unRegisterInterceptors = function unRegisterInterceptors(interceptor) {
	for (let interceptorId of this.interceptorIds) {
		interceptor.unRegister(interceptorId);
	}
}

module.exports = LocalStorageFFSCacheManager;
