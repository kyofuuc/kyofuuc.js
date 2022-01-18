
'use strict';

const utils = require('../utils');
const defaults = require('../helpers/defaults');
const FuInterceptor = require('./FuInterceptor');

function KyofuucWS(wsConfig) {
	this.state = 0;
	this.protocol = "";
	this.wsConfig = wsConfig || {};
	this.interceptor = this.wsConfig.interceptor || new FuInterceptor();
	this.eventHooks = {
		"onOpen": [],
		"onMessage": [],
		"onClose": [],
		"onError": []
	};
}

KyofuucWS.prototype.ws = function ws(urlOrConfig, config) {
	const instance = utils.mergeClasses(new KyofuucWS(), this);
	if (typeof urlOrConfig === 'string') {
		config = config || {};
		config.url = urlOrConfig;
	} else {
		config = urlOrConfig || {};
	}
	config = utils.mergeObject(config, instance.wsConfig);
	const connector = (config.connector || defaults.getDefaultWSConnector());

	// onError event
	instance.interceptor.registerOnWSError((options, config, event) => {
		utils.forEach(instance.eventHooks.onError, (cb) => cb(instance, event));
	}, { instance });

	// onClose event
	instance.interceptor.registerOnWSClose((options, config, event) => {
		instance.state = event.target.readyState
		utils.forEach(instance.eventHooks.onClose, (cb) => cb(instance, event));
	}, { instance });

	// onOpen event
	instance.interceptor.registerOnWSOpen((options, config, event) => {
		if (instance.connection && instance.connection.implname === "wsConnector") {
			instance.state = event.target.readyState;
			instance.protocol = instance.connection.protocol;
		}
		utils.forEach(instance.eventHooks.onOpen, (cb) => cb(instance, event));
	}, { instance: instance });

	// onMessage event
	instance.interceptor.registerOnWSMessage((options, config, event) => {
		let data;
		let sanitizedData;
		let implName = instance.connectionImplName;

		if (implName === "wsConnector") {
			data = event.data;
		}
		switch (instance.protocol.toLowerCase()) {
			case "json":
				sanitizedData = JSON.parse(data);
				break;
			default:
				sanitizedData = data;
				break;
		}
		utils.forEach(instance.eventHooks.onMessage, (cb) => cb(instance, event, sanitizedData));
	}, { instance });
	instance.connection = connector(config, instance.interceptor);
	instance.connectionImplName = instance.connection.implname;

	return instance;
};

KyofuucWS.prototype.connection = function connection() {
	return this.connection;
};

KyofuucWS.prototype.close = function close() {
	this.state = 2;
	this.connection && this.connection.close();
};

KyofuucWS.prototype.sendMessage = function sendMessage(message) {
	if (!this.connection) return;

	this.state = 5;
	if (utils.isObject(message) && this.protocol.toLowerCase() === "json") {
		message = JSON.safeStringify(message);
	} else {
		message = String(message);
	}
	this.connection.send(message);
	this.state = 1;
};

utils.forEach([ "onOpen", "onMessage", "onClose", "onError" ], function forEachWSEvent(event) {
	KyofuucWS.prototype[event] = function (eventHook) {
		this.eventHooks[event].push(eventHook);
	}
});

KyofuucWS.STATE = {
	CONNECTING: 0,
	CONNECTED: 1,
	READY: 1,
	DISCONNECTING: 2,
	DISCONNECTED: 3,
	PROCESSIMG_OUTGOING_MESSAGE: 4,
	PROCESSIMG_INCOMMING_MESSAGE: 5,
};

module.exports = KyofuucWS;
