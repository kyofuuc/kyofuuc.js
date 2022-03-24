
'use strict';

const utils = require('../utils');
const defaults = require('../helpers/defaults');
const FuInterceptor = require('./FuInterceptor');

function KyofuucWS(wsConfig) {
	this.state = 0;
	this.protocol = "";
	this._reconnectionCount = 0;
	this._nextReconnectionDelay = 0;
	this.lastReconnectionCount = 0;
	this.wsConfig = wsConfig || {};
	this.interceptor = this.wsConfig.interceptor || new FuInterceptor();
	this.eventHooks = {
		"onOpen": [],
		"onClose": [],
		"onError": [],
		"onMessage": [],
		"onStateChange": []
	};
}

KyofuucWS.prototype.reconnect = function reconnect(connector) {
	if (this.state != 2 && this.state != 3) {
		this.close();
	}
	if (!connector) connector = (this.wsConfig.connector || defaults.getDefaultWSConnector());
	this.state = 4;
	utils.forEach(this.eventHooks.onStateChange, (cb) => cb(this, this.state));
	this.connection = connector(this.wsConfig, this.interceptor);
}

KyofuucWS.prototype.ws = function ws(urlOrConfig, config) {
	const instance = utils.mergeClasses(new KyofuucWS(), this);
	if (typeof urlOrConfig === 'string') {
		config = config || {};
		config.url = urlOrConfig;
	} else {
		config = urlOrConfig || {};
	}
	instance.wsConfig = utils.mergeObject(config, instance.wsConfig);
	config = instance.wsConfig;
	const connector = (config.connector || defaults.getDefaultWSConnector());

	// onStateChange event, not neede
	/*instance.interceptor.registerOnWSStateChange((options, config, state) => {
		utils.forEach(instance.eventHooks.onStateChange, (cb) => cb(instance, state));
	}, { instance });*/

	// onError event
	instance.interceptor.registerOnWSError((options, config, event) => {
		utils.forEach(instance.eventHooks.onError, (cb) => cb(instance, event));
	}, { instance });

	// onClose event
	instance.interceptor.registerOnWSClose((options, config, event) => {
		if (instance.state !== 2 && instance.wsConfig.reconnect === true) {
			if (instance.lastReconnectionCount < instance.wsConfig.maxReconnect) {
				instance._reconnectionCount++;
				instance.lastReconnectionCount++;
				instance._nextReconnectionDelay = instance.wsConfig.reconnectIntervalByPower 
					? Math.pow(instance.wsConfig.reconnectInterval, instance._reconnectionCount)
					: instance.wsConfig.reconnectInterval;
				setTimeout(instance.reconnect.bind(instance, connector), instance._nextReconnectionDelay * 1000);
				return;
			}
		}
		instance.state = event.target.readyState;
		utils.forEach(instance.eventHooks.onStateChange, (cb) => cb(instance, instance.state));
		utils.forEach(instance.eventHooks.onClose, (cb) => cb(instance, event));
	}, { instance });

	// onOpen event
	instance.interceptor.registerOnWSOpen((options, config, event) => {
		instance._reconnectionCount = 0;
		instance._nextReconnectionDelay = 0;
		if (instance.connection && instance.connection.implname === "wsConnector") {
			instance.state = event.target.readyState;
			utils.forEach(instance.eventHooks.onStateChange, (cb) => cb(instance, instance.state));
			instance.protocol = instance.connection.protocol;
			instance.extensions = instance.connection.extensions;
		}
		utils.forEach(instance.eventHooks.onOpen, (cb) => cb(instance, event));
	}, { instance: instance });

	// onMessage event
	instance.interceptor.registerOnWSMessage((options, config, event) => {
		let data;
		let sanitizedData;
		let cachedState = instance.state;
		let implName = instance.connectionImplName;

		instance.state = 6;
		utils.forEach(instance.eventHooks.onStateChange, (cb) => cb(instance, instance.state));
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
		instance.state = cachedState;
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
	console.log("PROTOCOL", this.protocol)
	if (utils.isObject(message) && this.protocol.toLowerCase() === "json") {
		message = JSON.safeStringify(message);
	} else {
		//message = String(message);
	}
	this.connection.send(message);
	this.state = 1;
};

KyofuucWS.prototype.getBufferedAmount = function getBufferedAmount() {
	if (!this.connection) return;
	if (this.connectionImplName === "wsConnector") {
		return this.connection.bufferedAmount;
	}
};

KyofuucWS.prototype.getUrl = function getUrl() {
	if (!this.connection) return;
	if (this.connectionImplName === "wsConnector") {
		return this.connection.url;
	}
};

KyofuucWS.prototype.getBinaryType = function getBinaryType() {
	if (!this.connection) return;
	if (this.connectionImplName === "wsConnector") {
		return this.connection.binaryType;
	}
};

KyofuucWS.prototype.setBinaryType = function setBinaryType(type) {
	if (!this.connection) return;
	if (this.connectionImplName === "wsConnector") {
		this.connection.binaryType = type;
	}
};

utils.forEach([ "onOpen", "onMessage", "onClose", "onError", "onStateChange" ], function forEachWSEvent(event) {
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
	RECONNECTING: 4,
	PROCESSIMG_OUTGOING_MESSAGE: 5,
	PROCESSIMG_INCOMMING_MESSAGE: 6,
};

module.exports = KyofuucWS;
