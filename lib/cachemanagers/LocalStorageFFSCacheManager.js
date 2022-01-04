
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
	const preInterceptorId = interceptor.registerPreRequest(function lsFFSCMPReqInterceptor(options, config) {
		if (!config.cache) return;
		config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
		let cachedValue = (localStorageImpl || localStorage).getItem(config.key);
		if (cachedValue && config.refreshCache) localStorage.removeItem(config.key);
		cachedValue = (typeof options.encryptor === 'function') ? options.decryptor(cachedValue, options) : cachedValue;
		if (cachedValue === undefined) return;
		return {
			FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
			key: config.key,
			value: cachedValue
		};
	}, {
		decryptor: this.decryptor
	});
	this.interceptorIds.push(preInterceptorId);

	const postInterceptorId = interceptor.registerPreResponse(function lsFFSCMPResInterceptor(options, config, response) {
		if (!config.cache) return;
		if (response) {
			config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
			let encryptedResponse = (typeof options.encryptor === 'function') ? options.encryptor(response, options) : response;
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
