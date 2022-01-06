
'use strict';

const utils = require('../utils');
const FuInterceptor = require('./FuInterceptor');

function KyofuucHttp(httpBaseConfig) {
	this.httpBaseConfig = httpBaseConfig || {};
	this.httpInterceptor = this.httpBaseConfig.httpInterceptor || new FuInterceptor();
	if (this.httpBaseConfig.cache && typeof this.httpBaseConfig.cache.registerInterceptors === 'function') {
		this.httpBaseConfig.cache.registerInterceptors(this.httpInterceptor);
	}
}

KyofuucHttp.prototype.request = function request(urlOrConfig, config) {
	if (typeof urlOrConfig === 'string') {
		config = config || {};
		config.url = urlOrConfig;
	} else {
		config = urlOrConfig || {};
	}
	let tempCache = config.cache;
	config = utils.mergeObject(config, this.httpBaseConfig);
	if (tempCache && tempCache.httpInterceptorIds.length === 0) {
		tempCache.registerInterceptors(this.httpInterceptor);
	}
	let promise;
	// ssFFSCacheManager.constructor.name
	utils.invokeForEachInterceptorType(this.httpInterceptor, "PRE_REQUEST", config);
	//call request
	//promise = fetch(this.getUrl(config));
	utils.invokeForEachInterceptorType(this.httpInterceptor, "POST_REQUEST", config);
	utils.invokeForEachInterceptorType(this.httpInterceptor, "PRE_RESPONSE", config, {});
	//after treating response
	utils.invokeForEachInterceptorType(this.httpInterceptor, "POST_RESPONSE", config, {});
	if (tempCache && tempCache.httpInterceptorIds.length > 0) {
		tempCache.unRegisterInterceptors(this.httpInterceptor);
	}
	return promise;
}

KyofuucHttp.prototype.getUrl = function getUrl(config) {
	if (!config.url) {
		throw new Error("Invalid config url provider");
	}
	config = utils.mergeObject(config, this.httpBaseConfig);
	return utils.buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoPayload(method) {
	KyofuucHttp.prototype[method] = function (url, config) {
		return this.request(utils.mergeObject(config, {
			method,
			url,
			data: (config || {}).data
		}));
	}
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithPayload(method) {
	KyofuucHttp.prototype[method] = function (url, data, config) {
		return this.request(utils.mergeObject(config, {
			method,
			url,
			data
		}));
	}
});


module.exports = KyofuucHttp;