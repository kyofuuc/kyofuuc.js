
'use strict';

const utils = require('../utils');
const defaults = require('../helpers/defaults');
const FuInterceptor = require('./FuInterceptor');

function KyofuucHttp(httpBaseConfig) {
	this.httpBaseConfig = httpBaseConfig || {};
	this.httpInterceptor = this.httpBaseConfig.interceptor || new FuInterceptor();
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
	/*if (!config.url.startsWith("http")) {
		config.url = `http://${config.url}`;
	}*/
	if (tempCache && tempCache.httpInterceptorIds.length === 0) {
		tempCache.registerInterceptors(this.httpInterceptor);
	}
	let promise;
	const connector = (config.connector || defaults.getDefaultHttpConnector());
	promise = connector(config, this.httpInterceptor);
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

