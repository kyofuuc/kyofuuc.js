
'use strict';

const utils = require('../utils');

function FuInterceptor() {
	this.handlers = [];
}

FuInterceptor.prototype.register = function register(type, cb, options) {
	this.handlers.push({
		type,
		cb,
		options
	});
	return this.handlers.length-1;
}

FuInterceptor.prototype.registerPreRequest = function registerPreRequest(cb, options) {
	return this.register("PRE_REQUEST", cb, options);
}

FuInterceptor.prototype.registerPostRequest = function registerPostRequest(cb, options) {
	return this.register("POST_REQUEST", cb, options);
}

FuInterceptor.prototype.registerPreResponse = function registerPreResponse(cb, options) {
	return this.register("PRE_RESPONSE", cb, options);
}

FuInterceptor.prototype.registerPostResponse = function registerPostResponse(cb, options) {
	return this.register("POST_RESPONSE", cb, options);
}

FuInterceptor.prototype.unRegister = function unRegister(id) {
	if (this.handlers[id]) {
		this.handlers[id] = null;
	}
}

FuInterceptor.prototype.filter = function filter(cond) {
	return this.handlers.filter(cond);
}

FuInterceptor.prototype.forEach = function forEach(cb, type) {
	utils.forEach(this.handlers, function handlerLoop(handler) {
		if (handler !== null && (!type || handler.type === type)) {
			cb(handler);
		}
	});
}

module.exports = FuInterceptor;
