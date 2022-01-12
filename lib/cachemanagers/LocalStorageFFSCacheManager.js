
'use strict';

const utils = require("../utils");

function LocalStorageFFSCacheManager(encryptor, decryptor, localStorageImpl) {
	this.interceptorIds = [];
	this.encryptor = encryptor;
	this.decryptor = decryptor;
	this.interceptor = undefined;
	this.localStorageImpl = localStorageImpl;
}

LocalStorageFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
	if (!interceptor) return;
	const instance = this;
	this.interceptor = interceptor;
	let localStorageImpl = this.localStorageImpl;
	const preInterceptorId = interceptor.registerPreRequest(function lsFFSCMPReqInterceptor(options, config) {
		if (!config.cache) return;
		const cachedValue = options.get.call(instance, config);
		if (cachedValue !== undefined) {
			if (config.refreshCache) {
				(localStorageImpl || localStorage).removeItem(config.key);
				return;
			}
			return {
				FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
				key: config.key,
				value: cachedValue
			};
		}
	}, {
		decryptor: this.decryptor,
		get: this.get
	});
	this.interceptorIds.push(preInterceptorId);

	const postInterceptorId = interceptor.registerPreResponse(function lsFFSCMPResInterceptor(options, config, response) {
		if (!config.cache) return;
		if (response) {
			options.set.call(instance, config, response);
		}
	}, {
		encryptor: this.encryptor,
		set: this.set
	});
	this.interceptorIds.push(postInterceptorId);
}

LocalStorageFFSCacheManager.prototype.unRegisterInterceptors = function unRegisterInterceptors(interceptor) {
	for (let interceptorId of this.interceptorIds) {
		interceptor.unRegister(interceptorId);
	}
}

LocalStorageFFSCacheManager.prototype.get = function getFromLSFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	let cachedValue = (this.localStorageImpl || localStorage).getItem(config.key);
	if (cachedValue === null || cachedValue === undefined) return cachedValue;
	cachedValue = (typeof this.encryptor === 'function') ? this.decryptor(cachedValue, config) : cachedValue;
	if (cachedValue !== undefined) {
		return JSON.parse(cachedValue).value;
	}
}

LocalStorageFFSCacheManager.prototype.set = function setForLSFFSCM(config, value) {
	config.key = utils.buildCacheKey(config);
	value = JSON.stringify({ value });
	let encryptedValue = (typeof this.encryptor === 'function') ? this.encryptor(value, config) : value;
	(this.localStorageImpl || localStorage).setItem(config.key, encryptedValue);
}

LocalStorageFFSCacheManager.prototype.remove = function removeFromLSFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	(this.localStorageImpl || localStorage).removeItem(config.key);
}

module.exports = LocalStorageFFSCacheManager;
