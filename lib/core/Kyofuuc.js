
'use strict';

const utils = require('../utils');
const FuInterceptor = require('./FuInterceptor');

function Kyofuuc(config) {
	this.config = config;
	this.interceptor = new FuInterceptor();
}

Kyofuuc.prototype.request = function request(urlOrConfig, config) {
	if (typeof urlOrConfig === 'string') {
		config = config || {};
		config.url = urlOrConfig;
	} else {
		config = urlOrConfig || {};
	}
	// ssFFSCacheManager.constructor.name
	utils.invokeForEachInterceptorType(this.interceptor, "PRE_REQUEST", config);
	//call request
	utils.invokeForEachInterceptorType(this.interceptor, "POST_REQUEST", config);
	utils.invokeForEachInterceptorType(this.interceptor, "PRE_RESPONSE", config);
	//after treating response
	utils.invokeForEachInterceptorType(this.interceptor, "POST_RESPONSE", config);
	/*utils.forEach(this.interceptor.filter(h => h.type === "PRE_REQUEST"), function(handler) {
		if (typeof handler.when === 'function' && interceptor.when(config) === false) return;
		handler.cb(handler.options, config)
	});*/
}

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