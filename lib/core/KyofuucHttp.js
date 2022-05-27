
'use strict';

const utils = require('../utils');
const defaults = require('../helpers/defaults');
const FuInterceptor = require('./FuInterceptor');
const FuQueueManager = require('./FuQueueManager');

function KyofuucHttp(httpBaseConfig) {
	this.httpBaseConfig = httpBaseConfig || {};
	this.httpInterceptor = this.httpBaseConfig.interceptor || new FuInterceptor();
	if (this.httpBaseConfig.cache && typeof this.httpBaseConfig.cache.registerInterceptors === 'function') {
		this.httpBaseConfig.cache.registerInterceptors(this.httpInterceptor);
	}
}

function putInRetryQueue(config) {
	const fuQueueManager = config.fuQueueManager || new FuQueueManager();
	config._retryCount = !utils.isNumber(config._retryCount) ? 1 : ++config._retryCount;
	if (!utils.isNumber(config.maxRetry)) {
		config.maxRetry = defaults.maxReconnectOrRetry;
	}
	if (config._retryCount > config.maxRetry) {
		utils.forEach(utils.getGlobalEvent(utils.GLOBAL_EVENT_NAMES.RETRY_MAXED_OUT), (cb) => cb(config));
		return;
	}
	config._cacheName = config.cache ? config.cache.constructor.name : "";
	fuQueueManager.push({
		type: "KYOFUUC_HTTP_REQUEST",
		config
	});
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

	if (tempCache && tempCache.interceptorIds.length === 0) {
		tempCache.registerInterceptors(this.httpInterceptor);
	}
	if (config.retry) {
		config.putInRetryQueue = putInRetryQueue;
	}

	let promise;
	const connector = (config.connector || defaults.getDefaultHttpConnector());
	promise = connector(config, this.httpInterceptor);
	if (tempCache && tempCache.interceptorIds.length > 0) {
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
		if (!config) config = {};
		if (!config.headers) config.headers = {};
		if (!config.headers["accept"] && !config.headers["Accept"] && !config.headers["ACCEPT"]) {
			config.headers["Accept"] = "application/json, text/plain, */*";
		}
		return this.request(utils.mergeObject(config, {
			method,
			url,
			data
		}));
	}
});

module.exports = KyofuucHttp;

