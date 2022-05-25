
'use strict';

const utils = require('../utils');
//const FuQueueManager = require('../core/FuQueueManager');

const maxReconnectOrRetry = 99999;

function getDefaultHttpConnector() {
	let connector;
	if (typeof XMLHttpRequest !== 'undefined') { 
		connector = require('../connectors/http/xhrConnector');
	} else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
		connector = require('../connectors/http/httpConnector');
	}
	return connector;
}

function getDefaultWSConnector() {
	let connector = require('../connectors/ws/wsConnector');
	return connector;
}

function getHttpAgent() {
	if (utils.envIsNodeJs()) {
		const http = require("http");
		const https = require("https");
		return {
			httpAgent: new http.Agent({ keepAlive: true }),
			httpsAgent: new https.Agent({ keepAlive: true }),
		};
	}
	return {};
}

const httpConfig = {
	connector: getDefaultHttpConnector(),
	timeout: 0,
	xsrfCookieName: 'XSRF-TOKEN',
	xsrfHeaderName: 'X-XSRF-TOKEN',
	maxContentLength: -1,
	maxBodyLength: -1,
	maxRedirects: 5,
	timeout: 5000,
	responseType: "json",
	validateStatus: function validateStatus(status) {
		return status >= 200 && status < 300;
	},
	headers: {
		'Accept': 'application/json, text/plain, */*'
	},
	retry: false,
	maxRetry: maxReconnectOrRetry,
	onRetryCompleted: null,
	...getHttpAgent()
};

const wsConfig = {
	connector: getDefaultWSConnector(),
	protocol: [],
	reconnect: false,
	maxReconnect: maxReconnectOrRetry,
	reconnectInterval: -1,
	reconnectIntervalByPower: false
};

//const fuQueueManager = new FuQueueManager();

module.exports = {
	wsConfig,
	httpConfig,
	getHttpAgent,
	//fuQueueManager,
	maxReconnectOrRetry,
	getDefaultWSConnector,
	getDefaultHttpConnector
}
