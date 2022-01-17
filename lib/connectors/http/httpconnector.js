
'use strict';

const url = require('url');
const zlib = require('zlib');
const http = require("http");
const https = require("https");
const utils = require('../../utils');


// TODO treat cancellation
// TODO treat proxy
function httpConnector(config, httpInterceptor) {
	return new Promise(function makeRequest(resolvePromise, rejectPromise) {

		let rejected = false;
		httpInterceptor = httpInterceptor || (config.cache && config.cache.interceptor
			? config.cache.interceptor 
			: httpInterceptor);

		let resolve = function resolve(value) {
			if (rejected) return;
			utils.invokeForEachInterceptorType(httpInterceptor, "HTTP_POST_RESPONSE", config, value);
			resolvePromise(value);
		};
		let reject = function reject(value) {
			rejected = true;
			rejectPromise(value);
		}
		const preRequestResults = utils
			.invokeForEachInterceptorType(httpInterceptor, "HTTP_PRE_REQUEST", config)
			.filter(preRequestResult => preRequestResult.FROM_FFS_CACHE_MANAGER_INTERCEPTOR === true);
		if (preRequestResults.length > 0 && !config.refreshCache) {
			preRequestResults[0].value.isFromCache = true;
			resolvePromise(preRequestResults[0].value);
			return;
		}

		let data = config.data;
		let headers = config.headers || {};
		let headerNames = Object.keys(headers).reduce((acc, header) => {
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
			//timeout: config.timeout,,
			withCredentials: config.withCredentials,
			method: (config.method || "get").toUpperCase(),
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
		} else {
			transport = isHttpsRequest ? https : http;
		}

		if (config.maxBodyLength > -1) {
			options.maxBodyLength = config.maxBodyLength;
		}
		if (config.insecureHTTPParser) {
			options.insecureHTTPParser = config.insecureHTTPParser;
		}

		const redirectsData = [];

		function processResponse(res, lastRequest, isFinalRequest, onSuccess, onError) {
			let stream = res;
			let response = {
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: res.headers,
				config: config,
				request: lastRequest,
				isFromCache: false
			};
			if (isFinalRequest) {
				utils.invokeForEachInterceptorType(httpInterceptor, "HTTP_PRE_RESPONSE", config, response);
			}
			if (config.responseType === 'stream') {
				response.data = stream;
				onSuccess(response);
			} else {
				let responseBuffer = [];
				let totalResponseBytes = 0;
				stream.on('data', function handleStreamData(chunk) {
					responseBuffer.push(chunk);
					totalResponseBytes += chunk.length;
					if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
						// stream.destoy() emit aborted event before calling reject() on Node.js v16
						rejected = true;
						stream.destroy();
						onError(utils.kyofuucError(
							'maxContentLength size of ' + config.maxContentLength + ' exceeded',
							config, 
							utils.ERROR_CODES.MAXCONTENTLENGTH_EXCEEDED, 
							lastRequest
						));
					}
				});

				stream.on('aborted', function handlerStreamAborted() {
					if (rejected) {
						return;
					}
					stream.destroy();
					onError(utils.kyofuucError(
						'error request aborted', 
						config, 
						utils.ERROR_CODES.REQUEST_ABORTED,
						lastRequest));
				});

				stream.on('error', function handleStreamError(err) {
					if (req.aborted) return;
					onError(utils.kyofuucError(err, config, utils.ERROR_CODES.STREAM_ERROR, lastRequest));
				});

				stream.on('end', function handleStreamEnd() {
					try {
						let responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
						if (config.responseType !== 'arraybuffer') {
							responseData = responseData.toString(config.responseEncoding);
							if (!config.responseEncoding || config.responseEncoding === 'utf8') {
								responseData = utils.stripBOM(responseData);
							}
						}
						response.body = responseData;
						if (config.responseType && config.responseType.toLowerCase().indexOf("json") != -1) {
							try {
								response.data = JSON.parse(response.body);
							} catch (err) {
								response.data = response.body;
								onError(utils.kyofuucError(
									'error trying to parse response body to data JSON',
									config,
									utils.ERROR_CODES.ERR_PROCESSING_BODY_AS_JSON_DATA,
									response.request,
									response
								));
							}
						} else {
							response.data = response.body;
						}
					} catch (err) {
						onError(utils.kyofuucError(err, config, utils.ERROR_CODES.ERR_PROCESSING_DATA, response.request, response));
					}
					onSuccess(response);
				});
			}
			return response;
		}

		function transportRequest(redirectCount) {
			let req = transport.request(options, function handleResponse(res) {
				if (req.aborted || rejected) return;
				let lastRequest = res.req || req;

				// handle redirect
				if ((res.statusCode === 301 || res.statusCode === 302) && res.headers['location']) {
					const newLocation = res.headers['location'];
					if ((++redirectCount) <= config.maxRedirects) {
						parsed = url.parse(newLocation);
						if (!config.socketPath) {
							options.hostname = parsed.hostname;
							options.port = parsed.port;
							options.path = utils.buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, '')
						}
						if (config.storeRedirectsData) {
							function resolveReResponse(result) {
								redirectsData.push(result);
								req.abort();
							}
							processResponse(res, lastRequest, false, resolveReResponse, resolveReResponse);
						} else {
							req.abort();
						}
						transportRequest(redirectCount);
						return;
					}
				}
				if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
					switch (res.headers['content-encoding']) {
						case 'gzip':
						case 'compress':
						case 'deflate':
							stream = stream.pipe(zlib.createUnzip());
							delete res.headers['content-encoding'];
							break;
					}
				}
				processResponse(res, lastRequest, true, function onSuccess(result) {
					if (config.storeRedirectsData) {
						result.redirectsData = redirectsData;
					}
					utils.resolveResponse(result, resolve, reject);
				}, function onError(result) {
					reject(result);
				});
			});
			if (redirectCount === 0) {
				utils.invokeForEachInterceptorType(httpInterceptor, "HTTP_POST_REQUEST", config);
			}

			req.on('error', function handleRequestError(error) {
				if (req.aborted && error.code !== 'ERR_FR_TOO_MANY_REDIRECTS') return;
				reject(utils.kyofuucError(error, config, null, req));
			});
			req.on('socket', function handleRequestSocket(socket) {
				socket.setKeepAlive(true, 1000 * 60);
			});

			if (config.timeout) {
				let timeout = parseInt(config.timeout, 10);
				if (isNaN(timeout)) {
					reject(utils.kyofuucError('error trying to parse `config.timeout` to int',
						config,
						'ERR_PARSE_TIMEOUT',
						req
					));
					return;
				}

				req.setTimeout(timeout, function handleRequestTimeout() {
					req.abort();
					reject(utils.kyofuucError(
						'timeout of ' + timeout + 'ms exceeded',
						config,
						utils.ERROR_CODES.TIMEOUT_ERROR,
						req
					));
				});
			}

			if (utils.isStream(data)) {
				data.on('error', function handleStreamError(err) {
					reject(utils.kyofuucError(err, config, null, req));
				}).pipe(req);
			} else {
				req.end(data);
			}
		}
		transportRequest(0);
	});
}

module.exports = httpConnector;

