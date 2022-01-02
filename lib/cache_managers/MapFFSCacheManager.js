
'use strict';

function MapFFSCacheManager(interceptor, mapOrObject) {
	this.interceptor = interceptor;
	this.bucket = mapOrObject || {};
	this.interceptor.registerPreRequest(function(options, config) {
		if (!config.cache) return;
		config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
		if (options.bucket[config.key] !== undefined) {
			return options.bucket[config.key];
		}
		return;
	}, {
		bucket: this.bucket
	});
	
	this.interceptor.registerPostResponse(function(options, config) {
		if (!config.cache) return;
		if (config.response) {
			config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
			options.bucket[config.key] = config.response;
		}
	}, {
		bucket: this.bucket
	});
}

module.exports = MapFFSCacheManager;
