
'use strict';

const utils = require('../utils');

function getDefaultHttpConnector() {
	let connector;
	if (typeof XMLHttpRequest !== 'undefined') { 
		connector = require('../connectors/http/xhrConnector');
	} else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
		connector = require('../connectors/http/httpConnector');
	}
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
		common: {
			'Accept': 'application/json, text/plain, */*'
		}
	},
	...getHttpAgent()
};

const wsConfig = {

};

module.exports = {
	wsConfig,
	httpConfig,
	getHttpAgent,
	getDefaultHttpConnector
}
