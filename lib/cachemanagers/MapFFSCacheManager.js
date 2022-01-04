
'use strict';

function MapFFSCacheManager(mapOrObject) {
	this.interceptorIds = [];
	this.bucket = mapOrObject || {};
}

MapFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
	if (!interceptor) return;
	const preInterceptorId = interceptor.registerPreRequest(function mFFSCMPReqInterceptor(options, config) {
		if (!config.cache) return;
		config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
		if (options.bucket[config.key] !== undefined) {
			if (config.refreshCache) {
				delete options.bucket[config.key];
				return;
			}
			let value = options.bucket[config.key];
			if (value === undefined) return;
			return {
				FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
				key: config.key,
				value: value
			};
		}
		return;
	}, {
		bucket: this.bucket
	});
	this.interceptorIds.push(preInterceptorId);
	
	const postInterceptorId = interceptor.registerPostResponse(function mFFSCMPResInterceptor(options, config, response) {
		if (!config.cache) return;
		if (response) {
			config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
			options.bucket[config.key] = response;
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
