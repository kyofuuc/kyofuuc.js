
'use strict';

const utils = require('../../utils');
const http = require("http");
const https = require("https");


// TODO treat cancellation
// TODO treat proxy
function httpConnector(config, interceptors) {
	return new Promise(function makeRequest(resolvePromise, rejectPromise) {

		let rejected = false;
		let resolve = function resolve(value) {
			resolvePromise(value);
		};
		let reject = function reject(value) {
			rejected = true;
			rejectPromise(value);
		}

		var data = config.data;
		var headers = config.headers;
		var headerNames = Object.keys(headers).reduce((acc, header) => {
			acc[header.toLowerCase()] = header;
			return acc;
		}, {});

		// for server that requires User-Agent
		if (!('user-agent' in headerNames)) {
			headers['User-Agent'] = `kyofuuc/${utils.VERSION}`;
		} else {
			if (!headers[headerNames['user-agent']]) {
				delete headers[headerNames['user-agent']];
			}
		}
		if (data && !utils.isStream(data)) {
			if (utils.isString(data)) {
				data = Buffer.from(data, 'utf-8');
			} else if (utils.isArrayBuffer(data)) {
				data = Buffer.from(new Uint8Array(data));
			} else if (Buffer.isBuffer(data)) {
			} else {
				return reject(utils.kyofuucError(
					'Request aata after must be an ArrayBuffer, a string, a Stream, or a Buffer',
					config
				));
			}
		}
		console.log()
		console.log(headers)
	});
}

module.exports = httpConnector;

