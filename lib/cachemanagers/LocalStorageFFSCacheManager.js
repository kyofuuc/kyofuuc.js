
'use strict';

const utils = require("../utils");

function LocalStorageFFSCacheManager(options) {
	this.interceptorIds = [];
	this.interceptor = undefined;
	if (utils.isObject(options) && options.encryptor) {
		this.encryptor = options.encryptor;
		this.decryptor = options.decryptor;
		this.localStorageImpl = options.bucket;
	} else {
		this.localStorageImpl = options;
	}
	this.localStorageImpl = this.localStorageImpl || localStorage;
}

LocalStorageFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
	if (!interceptor) return;
	const instance = this;
	this.interceptor = interceptor;
	const localStorageImpl = this.localStorageImpl;
	const preInterceptorId = interceptor.registerPreRequest(function lsFFSCMPReqInterceptor(options, config) {
		if (!config.cache) return;
		const cachedValue = options.get.call(instance, config);
		if (cachedValue !== undefined) {
			if (config.refreshCache) {
				localStorageImpl.removeItem(config.key);
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

	const postInterceptorId = interceptor.registerPostResponse(function lsFFSCMPResInterceptor(options, config, response) {
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
	let cachedValue = this.localStorageImpl.getItem(config.key);
	if (cachedValue === null || cachedValue === undefined) return cachedValue;
	cachedValue = (typeof this.encryptor === 'function') ? this.decryptor(cachedValue, config) : cachedValue;
	if (cachedValue !== undefined) {
		return JSON.parse(cachedValue).value;
	}
}

LocalStorageFFSCacheManager.prototype.set = function setForLSFFSCM(config, value) {
	config.key = utils.buildCacheKey(config);
	value = JSON.safeStringify({ value });
	let encryptedValue = (typeof this.encryptor === 'function') ? this.encryptor(value, config) : value;
	this.localStorageImpl.setItem(config.key, encryptedValue);
}

LocalStorageFFSCacheManager.prototype.remove = function removeFromLSFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	this.localStorageImpl.removeItem(config.key);
}

module.exports = LocalStorageFFSCacheManager;
