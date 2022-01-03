
'use strict';

const utils = require('../utils');
const FuInterceptor = require('./FuInterceptor');

function Kyofuuc(baseConfig) {
	this.baseConfig = baseConfig || {};
	this.interceptor = this.baseConfig.interceptor || new FuInterceptor();
	if (this.cache && typeof this.cache.registerInterceptors === 'function') {
		this.cache.registerInterceptors(this.interceptor);
	}
}

Kyofuuc.prototype.request = function request(urlOrConfig, config) {
	if (typeof urlOrConfig === 'string') {
		config = config || {};
		config.url = urlOrConfig;
	} else {
		config = urlOrConfig || {};
	}
	let tempCache = config.cache;
	config = utils.mergeObject(config, this.baseConfig);
	if (tempCache && tempCache.interceptorIds.length === 0) {
		tempCache.registerInterceptors(this.interceptor);
	}
	// ssFFSCacheManager.constructor.name
	utils.invokeForEachInterceptorType(this.interceptor, "PRE_REQUEST", config);
	//call request
	utils.invokeForEachInterceptorType(this.interceptor, "POST_REQUEST", config);
	utils.invokeForEachInterceptorType(this.interceptor, "PRE_RESPONSE", config, {});
	//after treating response
	utils.invokeForEachInterceptorType(this.interceptor, "POST_RESPONSE", config, {});
	if (tempCache && tempCache.interceptorIds.length > 0) {
		tempCache.unRegisterInterceptors(this.interceptor);
	}
}

Kyofuuc.prototype.getUrl = function getUrl(config) {
	if (!config.url) {
		throw new Error("Invalid config url provider");
	}
	config = utils.mergeObject(config, this.baseConfig);
	return utils.buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoPayload(method) {
	Kyofuuc.prototype[method] = function (url, config) {
		return this.request(utils.mergeObject(config, {
			method,
			url,
			data: (config || {}).data
		}));
	}
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithPayload(method) {
	Kyofuuc.prototype[method] = function (url, data, config) {
		return this.request(utils.mergeObject(config, {
			method,
			url,
			data
		}));
	}
});


module.exports = Kyofuuc;