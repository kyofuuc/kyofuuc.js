
'use strict';

function MapFFSCacheManager(mapOrObject) {
	this.interceptorIds = [];
	this.bucket = mapOrObject || {};
}

MapFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
	if (!interceptor) return;
	const preInterceptorId = interceptor.registerPreRequest(function(options, config) {
		if (!config.cache) return;
		config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
		if (options.bucket[config.key] !== undefined) {
			if (config.refreshCache) delete options.bucket[config.key];
			return options.bucket[config.key];
		}
		return;
	}, {
		bucket: this.bucket
	});
	this.interceptorIds.push(preInterceptorId);
	
	const postInterceptorId = interceptor.registerPostResponse(function(options, config) {
		if (!config.cache) return;
		if (config.response) {
			config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
			options.bucket[config.key] = config.response;
		}
	}, {
		bucket: this.bucket
	});
	this.interceptorIds.push(postInterceptorId);
}

MapFFSCacheManager.prototype.unRegisterInterceptors = function unRegisterInterceptors(interceptor) {
	for (let interceptorId of this.interceptorIds) {
		interceptor.unRegister(interceptorId);
	}
}

module.exports = MapFFSCacheManager;
