
'use strict';

const utils = require('../../utils');
const KFXMLHttpRequest = utils.presentElseImport(typeof XMLHttpRequest, 
	() => XMLHttpRequest, 
	() => require("xmlhttprequest").XMLHttpRequest);

function xhrConnector(config, httpInterceptor) {
	return new Promise(function makeRequest(resolvePromise, rejectPromise) {
		let reqData = config.data || null;
		let reqHeaders = config.headers || {};
		let responseType = config.responseType;
		httpInterceptor = httpInterceptor || (config.cache && config.cache.interceptor
			? config.cache.interceptor 
			: httpInterceptor);

		if (utils.isFormData(reqData)) {
			delete reqHeaders['Content-Type'];
		}
		const preRequestResults = utils
			.invokeForEachInterceptorType(httpInterceptor, "PRE_REQUEST", config)
			.filter(preRequestResult => preRequestResult.FROM_FFS_CACHE_MANAGER_INTERCEPTOR === true);
		if (preRequestResults.length > 0) {
			preRequestResults[0].value.isFromCache = true;
			resolvePromise(preRequestResults[0].value);
			return;
		}
		let req = new KFXMLHttpRequest();
		if (config.auth) {
			let username = config.auth.username || '';
			let password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
			reqHeaders.Authorization = 'Basic ' + utils.toBase64(username + ':' + password);
		}
		let fullPath = utils.buildFullURLPath(config.baseURL, config.url);
    	req.open((config.method || "get").toUpperCase(), utils.buildURL(fullPath, config.params, config.paramsSerializer), true);
		
		function onloadend() {
			if (!req) {
				return;
			}
			let responseHeaders = 'getAllResponseHeaders' in req ? utils.parseHeaders(req.getAllResponseHeaders()) : null;
			let responseData = !responseType || responseType === 'text' ||  responseType === 'json' 
				? req.responseText 
				: req.response;
			let response = {
				status: req.status,
				statusText: req.statusText,
				headers: responseHeaders,
				config: config,
				request: req,
				isFromCache: false
			};
			utils.invokeForEachInterceptorType(httpInterceptor, "PRE_RESPONSE", config, response);
			response.body = responseData;
			if (config.responseType && config.responseType.toLowerCase().indexOf("json") != -1) {
				try {
					response.data = JSON.parse(response.body);
				} catch (err) {
					response.data = response.body;
					rejectPromise(utils.kyofuucError(
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
			utils.invokeForEachInterceptorType(httpInterceptor, "POST_RESPONSE", config, response);
			utils.resolveResponse(response, resolvePromise, rejectPromise);
			req = null;
		}
		if ('onloadend' in req) {
			req.onloadend = onloadend;
		} else {
			req.onreadystatechange = function handleLoad() {
				if (!req || req.readyState !== 4) {
					return;
				}
				if (req.status === 0 && !(req.responseURL && req.responseURL.indexOf('file:') === 0)) {
					return;
				}
				setTimeout(onloadend);
			};
		}
		req.onerror = function handleError() {
			rejectPromise(utils.kyofuucError(
				'Network error',
				config,
				utils.ERROR_CODES.NETWORK_ERROR,
				req
			));
			req = null;
		};
		req.onabort = function handleAbort() {
			if (!req) {
				return;
			}
			rejectPromise(utils.kyofuucError(
				'error request aborted',
				config,
				utils.ERROR_CODES.REQUEST_ABORTED,
				req
			));
			req = null;
		};
		req.ontimeout = function handleTimeout() {
			let timeoutErrorMessage = config.timeout 
				? 'timeout of ' + config.timeout + 'ms exceeded' 
				: 'timeout exceeded';
			if (config.timeoutErrorMessage) {
				timeoutErrorMessage = config.timeoutErrorMessage;
			}
			rejectPromise(utils.kyofuucError(
				timeoutErrorMessage,
				config,
				utils.ERROR_CODES.TIMEOUT_ERROR,
				req
			));
			req = null;
		};
		if ('setRequestHeader' in req) {
			utils.forEach(reqHeaders, function setRequestHeader(val, key) {
				if (typeof reqData === 'undefined' && key.toLowerCase() === 'content-type') {
					delete reqHeaders[key];
				} else {
					req.setRequestHeader(key, val);
				}
			});
		}
		if (utils.envIsStandardBrowser()) {
			let xsrfValue = (config.withCredentials || utils.isURLSameOrigin(fullPath)) && config.xsrfCookieName 
				? cookies.read(config.xsrfCookieName) 
				: undefined;		
			if (xsrfValue) {
				reqHeaders[config.xsrfHeaderName] = xsrfValue;
			}
		}
		if (!utils.isUndefined(config.withCredentials)) {
			req.withCredentials = !!config.withCredentials;
		}
		if (responseType && !(responseType.toLowerCase().indexOf("json") != -1)) {
			req.responseType = config.responseType;
		}
		if (typeof config.onDownloadProgress === 'function') {
			req.addEventListener('progress', config.onDownloadProgress);
		}
		if (typeof config.onUploadProgress === 'function' && req.upload) {
			req.upload.addEventListener('progress', config.onUploadProgress);
		}
		req.send(JSON.stringify(reqData));
		utils.invokeForEachInterceptorType(httpInterceptor, "POST_REQUEST", config);
	});
}

module.exports = xhrConnector;
