
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

// HTTP_PRE_REQUEST
// HTTP_POST_REQUEST
// HTTP_PRE_RESPONSE
// HTTP_POST_RESPONSE
utils.forEach(['PreRequest', 'PostRequest', 'PreResponse', 'PostResponse'], function forEachHttpLevel(level) {
	FuInterceptor.prototype[`register${level}`] = function (cb, options) {
		let type = level.split("Re");
		type = `HTTP_${type[0]}_RE${type[1]}`.toUpperCase();
		return this.register(type, cb, options);
	}
});

// WS_CLOSE
// WS_ERROR
// WS_MESSAGE
// WS_OPEN
utils.forEach([ 'Close', 'Error', 'Message', 'Open' , 'StateChange' ], function forEachWSEvent(event) {
	FuInterceptor.prototype[`registerOnWS${event}`] = function (cb, options) {
		return this.register(`WS_${event.toUpperCase()}`, cb, options);
	}
});

module.exports = FuInterceptor;
