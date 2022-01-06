
'use strict';

var url = require('url');
const http = require("http");
const https = require("https");
const utils = require('../../utils');


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
		var headers = config.headers || {};
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
			} else if (utils.isPlainObject(data) || utils.isObject(data) || utils.isArray(data)) {
				data = Buffer.from(JSON.stringify(data), 'utf-8');
			} else if (utils.isArrayBuffer(data)) {
				data = Buffer.from(new Uint8Array(data));
			} else if (Buffer.isBuffer(data)) {
			} else {
				return reject(utils.kyofuucError(
					'Request data after must be an ArrayBuffer, a string, a Stream, or a Buffer',
					config
				));
			}

			if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
				return reject(utils.kyofuucError('Request body larger than maxBodyLength limit', config));
			}
		
			// add Content-Length header if data exists
			if (!headerNames['content-length']) {
				headers['Content-Length'] = data.length;
			}
		}

		let auth = undefined;
		if (config.auth) {
			let username = config.auth.username || '';
			let password = config.auth.password || '';
			auth = username + ':' + password;
		}
		let fullPath = utils.buildFullURLPath(config.baseURL, config.url);
		let parsed = url.parse(fullPath);
		let protocol = parsed.protocol || 'http:';

		if (!auth && parsed.auth) {
			let urlAuth = parsed.auth.split(':');
			let urlUsername = urlAuth[0] || '';
			let urlPassword = urlAuth[1] || '';
			auth = urlUsername + ':' + urlPassword;
		}
	
		if (auth && headerNames.authorization) {
			delete headers[headerNames.authorization];
		}
		let isHttpsRequest = /https:?/.test(protocol);
		let agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

		let options = {
			auth: auth,
			agent: agent,
			headers: headers,
			method: config.method.toUpperCase(),
			agents: { http: config.httpAgent, https: config.httpsAgent },
			path: utils.buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, '')
		};
		if (config.socketPath) {
			options.socketPath = config.socketPath;
		} else {
			options.hostname = parsed.hostname;
			options.port = parsed.port;
		}

		// TODO treat proxy later

		let transport;
		if (config.transport) {
			transport = config.transport;
		} else if (config.maxRedirects === 0) {
			transport = isHttpsRequest ? https : http;
		} else {
			if (config.maxRedirects) {
				options.maxRedirects = config.maxRedirects;
			}
			// TODO manually handle redirects, use maxRedirects for halting
			//transport = isHttpsRequest ? httpsFollow : httpFollow;
			transport = isHttpsRequest ? https : http;
		}

		if (config.maxBodyLength > -1) {
			options.maxBodyLength = config.maxBodyLength;
		}
		if (config.insecureHTTPParser) {
			options.insecureHTTPParser = config.insecureHTTPParser;
		}

		console.log(options.hostname)
		var request = transport.request(options, function handleResponse(res) {
			if (request.aborted) return;
			console.log("RES", res);
		});

		request.on('error', function handleRequestError(error) {
			if (request.aborted && error.code !== 'ERR_FR_TOO_MANY_REDIRECTS') return;
			reject(utils.kyofuucError(error, config, null, req));
		});

		request.on('socket', function handleRequestSocket(socket) {
			socket.setKeepAlive(true, 1000 * 60);
		});

		console.log()
		console.log(headers, data, fullPath, protocol, auth);
	});
}

module.exports = httpConnector;

