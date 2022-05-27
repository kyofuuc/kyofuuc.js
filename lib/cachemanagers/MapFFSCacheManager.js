
'use strict';

const utils = require("../utils");

function MapFFSCacheManager(options) {
	this.interceptor = undefined;
	this.interceptorIds = [];
	if (utils.isObject(options) && options.bucket) {
		this.bucket = options.bucket;
	} else {
		this.bucket = options || {};
	}
}

MapFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
	if (!interceptor) return;
	const instance = this;
	this.interceptor = interceptor;
	const preInterceptorId = interceptor.registerPreRequest(function mFFSCMPReqInterceptor(options, config) {
		if (!config.cache) return;
		const cachedValue = options.get.call(instance, config)
		if (cachedValue !== undefined) {
			if (config.refreshCache) {
				delete options.bucket[config.key];
				return;
			}
			return {
				FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
				key: config.key,
				value: cachedValue
			};
		}
	}, {
		bucket: this.bucket,
		get: this.get
	});
	this.interceptorIds.push(preInterceptorId);
	
	const postInterceptorId = interceptor.registerPostResponse(function mFFSCMPResInterceptor(options, config, response) {
		if (!config.cache) return;
		if (response) {
			options.set.call(instance, config, response);
		}
	}, {
		bucket: this.bucket,
		set: this.set
	});
	this.interceptorIds.push(postInterceptorId);
}

MapFFSCacheManager.prototype.unRegisterInterceptors = function unRegisterInterceptors(interceptor) {
	for (let interceptorId of this.interceptorIds) {
		interceptor.unRegister(interceptorId);
	}
}

MapFFSCacheManager.prototype.get = function getFromMFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	const cachedValue = this.bucket[config.key];
	if (cachedValue !== undefined) {
		return JSON.parse(cachedValue).value;
	}
}

MapFFSCacheManager.prototype.set = function setForMFFSCM(config, value) {
	config.key = utils.buildCacheKey(config);
	this.bucket[config.key] = JSON.safeStringify({
		value
	});
}

MapFFSCacheManager.prototype.remove = function removeFromMFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	delete this.bucket[config.key];
}

module.exports = MapFFSCacheManager;
