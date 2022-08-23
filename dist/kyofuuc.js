(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ffs"] = factory();
	else
		root["ffs"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


module.exports = __webpack_require__(/*! ./lib/kyofuuc */ "./lib/kyofuuc.js");


/***/ }),

/***/ "./lib/cachemanagers/CookieFFSCacheManager.js":
/*!****************************************************!*\
  !*** ./lib/cachemanagers/CookieFFSCacheManager.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../utils */ "./lib/utils.js");

// example 2 days = ((2) *24*60*60*1000)
function ffCMSetCookie(cookiesImpl, name, value, expiryInMilliSeconds, options) {
    let expires = "";
    if (expiryInMilliSeconds) {
        let date = new Date();
        date.setTime(date.getTime() + (expiryInMilliSeconds));
        expires = "; expires=" + date.toUTCString();
    }
    if (cookiesImpl) {
        /*cookiesImpl.setItem(name, JSON.stringify({
            name,
            expires,
            value,
            path: "/"
        }));*/
        cookiesImpl.setItem(name, value);
    } else {
		let extraCookieOptions = "";
		if (options) {
			for (let key in options) {
				extraCookieOptions += `; ${key}`;
				if (options[key] !== true) {
					extraCookieOptions += `=${options[key]}`;
				}
			}
		}
        document.cookie = name + "=" + (value || "")  + expires + "; path=/" + extraCookieOptions;
    }
}

function ffCMGetCookie(cookiesImpl, name) {
    let nameWithEQ = name + "=";
    if (cookiesImpl) { return cookiesImpl.getItem(name) }
    let ca = document.cookie.split(';');
    for(let index = 0; index < ca.length; index++) {
        let c = ca[index];
        while (c.charAt(0)==' ') c = c.substring(1, c.length);
        if (c.indexOf(nameWithEQ) == 0) return c.substring(nameWithEQ.length, c.length);
    }
    return null;
}

function ffCMInvalidateCookie(cookiesImpl, name) {   
    if (cookiesImpl) {
        cookiesImpl.removeItem(name);
        return;
    }
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// expires in 24 hours by default, if it borswer cookie manager and not a custom implementation
// the cookie Secure attribute is set to true if undefined
function CookieFFSCacheManager(options) {
    this.interceptorIds = [];
	this.interceptor = undefined;
    if (utils.isObject(options) && options.encryptor) {
		this.encryptor = options.encryptor;
		this.decryptor = options.decryptor;
		this.cookiesImpl = options.bucket;
        this.expiryInMilliSeconds = options.expiryInMilliSeconds || ((1) *24*60*60*1000); 
	} else {
		this.cookiesImpl = options;
        this.expiryInMilliSeconds = ((1) *24*60*60*1000);
	}
}

CookieFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
    if (!interceptor) return;
	const instance = this;
	this.interceptor = interceptor;
    let cookiesImpl = this.cookiesImpl;
    let expiryInMilliSeconds = this.expiryInMilliSeconds;
    const preInterceptorId = interceptor.registerPreRequest(function cookieFFSCMPReqInterceptor(options, config) {
        if (!config.cache) return;
        const cachedValue = options.get.call(instance, config);
		if (cachedValue !== undefined) {
			if (config.refreshCache) {
				ffCMInvalidateCookie(instance.cookiesImpl, config.key);
				return;
			}
			return {
				FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
				key: config.key,
				value: cachedValue
			};
		}
    }, {
        decryptor: this.decryptor,
		get: this.get
    });
    this.interceptorIds.push(preInterceptorId);

    const postInterceptorId = interceptor.registerPostResponse(function cookieFFSCMPResInterceptor(options, config, response) {
        if (!config.cache) return;
        if (response) {
            options.set.call(instance, config, response);
        }
    }, {
        encryptor: this.encryptor,
		set: this.set
    });
    this.interceptorIds.push(postInterceptorId);
}

CookieFFSCacheManager.prototype.unRegisterInterceptors = function unRegisterInterceptors(interceptor) {
    for (let interceptorId of this.interceptorIds) {
        interceptor.unRegister(interceptorId);
    }
}

CookieFFSCacheManager.prototype.get = function getFromCFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	let cachedValue = ffCMGetCookie(this.cookiesImpl, config.key);
	if (cachedValue === null || cachedValue === undefined) return cachedValue;
	cachedValue = (typeof this.encryptor === 'function') ? this.decryptor(cachedValue, config) : cachedValue;
	if (cachedValue !== undefined) {
		return JSON.parse(cachedValue).value;
	}
}

CookieFFSCacheManager.prototype.set = function setForCFFSCM(config, value) {
	config.key = utils.buildCacheKey(config);
	value = JSON.safeStringify({ value });
	let encryptedValue = (typeof this.encryptor === 'function') ? this.encryptor(value, config) : value;
	let cacheOptions = config.cacheOptions || {};
	if (cacheOptions.Secure === undefined) cacheOptions.Secure = true;
	ffCMSetCookie(this.cookiesImpl, config.key, encryptedValue, this.expiryInMilliSeconds, cacheOptions);
}

CookieFFSCacheManager.prototype.remove = function removeFromCFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	ffCMInvalidateCookie(this.cookiesImpl, config.key);
}

module.exports = CookieFFSCacheManager;


/***/ }),

/***/ "./lib/cachemanagers/KeyvRedisFFSCacheManager.js":
/*!*******************************************************!*\
  !*** ./lib/cachemanagers/KeyvRedisFFSCacheManager.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";



function KeyvRedisFFSCacheManager(interceptor) {
}

module.exports = KeyvRedisFFSCacheManager;


/***/ }),

/***/ "./lib/cachemanagers/LocalStorageFFSCacheManager.js":
/*!**********************************************************!*\
  !*** ./lib/cachemanagers/LocalStorageFFSCacheManager.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../utils */ "./lib/utils.js");

function LocalStorageFFSCacheManager(options) {
	this.interceptorIds = [];
	this.interceptor = undefined;
	if (utils.isObject(options) && options.encryptor) {
		this.encryptor = options.encryptor;
		this.decryptor = options.decryptor;
		this.localStorageImpl = options.bucket;
	} else {
		this.localStorageImpl = options;
	}
	this.localStorageImpl = this.localStorageImpl || localStorage;
}

LocalStorageFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
	if (!interceptor) return;
	const instance = this;
	this.interceptor = interceptor;
	const localStorageImpl = this.localStorageImpl;
	const preInterceptorId = interceptor.registerPreRequest(function lsFFSCMPReqInterceptor(options, config) {
		if (!config.cache) return;
		const cachedValue = options.get.call(instance, config);
		if (cachedValue !== undefined) {
			if (config.refreshCache) {
				localStorageImpl.removeItem(config.key);
				return;
			}
			return {
				FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
				key: config.key,
				value: cachedValue
			};
		}
	}, {
		decryptor: this.decryptor,
		get: this.get
	});
	this.interceptorIds.push(preInterceptorId);

	const postInterceptorId = interceptor.registerPostResponse(function lsFFSCMPResInterceptor(options, config, response) {
		if (!config.cache) return;
		if (response) {
			options.set.call(instance, config, response);
		}
	}, {
		encryptor: this.encryptor,
		set: this.set
	});
	this.interceptorIds.push(postInterceptorId);
}

LocalStorageFFSCacheManager.prototype.unRegisterInterceptors = function unRegisterInterceptors(interceptor) {
	for (let interceptorId of this.interceptorIds) {
		interceptor.unRegister(interceptorId);
	}
}

LocalStorageFFSCacheManager.prototype.get = function getFromLSFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	let cachedValue = this.localStorageImpl.getItem(config.key);
	if (cachedValue === null || cachedValue === undefined) return cachedValue;
	cachedValue = (typeof this.encryptor === 'function') ? this.decryptor(cachedValue, config) : cachedValue;
	if (cachedValue !== undefined) {
		return JSON.parse(cachedValue).value;
	}
}

LocalStorageFFSCacheManager.prototype.set = function setForLSFFSCM(config, value) {
	config.key = utils.buildCacheKey(config);
	value = JSON.safeStringify({ value });
	let encryptedValue = (typeof this.encryptor === 'function') ? this.encryptor(value, config) : value;
	this.localStorageImpl.setItem(config.key, encryptedValue);
}

LocalStorageFFSCacheManager.prototype.remove = function removeFromLSFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	this.localStorageImpl.removeItem(config.key);
}

module.exports = LocalStorageFFSCacheManager;


/***/ }),

/***/ "./lib/cachemanagers/MapFFSCacheManager.js":
/*!*************************************************!*\
  !*** ./lib/cachemanagers/MapFFSCacheManager.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../utils */ "./lib/utils.js");

function MapFFSCacheManager(options) {
	this.interceptor = undefined;
	this.interceptorIds = [];
	if (utils.isObject(options) && options.bucket) {
		this.bucket = options.bucket;
	} else {
		this.bucket = options || {};
	}
}

MapFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
	if (!interceptor) return;
	const instance = this;
	this.interceptor = interceptor;
	const preInterceptorId = interceptor.registerPreRequest(function mFFSCMPReqInterceptor(options, config) {
		if (!config.cache) return;
		const cachedValue = options.get.call(instance, config)
		if (cachedValue !== undefined) {
			if (config.refreshCache) {
				delete options.bucket[config.key];
				return;
			}
			return {
				FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
				key: config.key,
				value: cachedValue
			};
		}
	}, {
		bucket: this.bucket,
		get: this.get
	});
	this.interceptorIds.push(preInterceptorId);
	
	const postInterceptorId = interceptor.registerPostResponse(function mFFSCMPResInterceptor(options, config, response) {
		if (!config.cache) return;
		if (response) {
			options.set.call(instance, config, response);
		}
	}, {
		bucket: this.bucket,
		set: this.set
	});
	this.interceptorIds.push(postInterceptorId);
}

MapFFSCacheManager.prototype.unRegisterInterceptors = function unRegisterInterceptors(interceptor) {
	for (let interceptorId of this.interceptorIds) {
		interceptor.unRegister(interceptorId);
	}
}

MapFFSCacheManager.prototype.get = function getFromMFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	const cachedValue = this.bucket[config.key];
	if (cachedValue !== undefined) {
		return JSON.parse(cachedValue).value;
	}
}

MapFFSCacheManager.prototype.set = function setForMFFSCM(config, value) {
	config.key = utils.buildCacheKey(config);
	this.bucket[config.key] = JSON.safeStringify({
		value
	});
}

MapFFSCacheManager.prototype.remove = function removeFromMFFSCM(config) {
	config.key = utils.buildCacheKey(config);
	delete this.bucket[config.key];
}

module.exports = MapFFSCacheManager;


/***/ }),

/***/ "./lib/cachemanagers/SessionStorageFFSCacheManager.js":
/*!************************************************************!*\
  !*** ./lib/cachemanagers/SessionStorageFFSCacheManager.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../utils */ "./lib/utils.js");
const LocalStorageFFSCacheManager = __webpack_require__(/*! ./LocalStorageFFSCacheManager */ "./lib/cachemanagers/LocalStorageFFSCacheManager.js");

function SessionStorageFFSCacheManager(options) {
	let forwardOptions = {};
	if (utils.isObject(options) && forwardOptions.encryptor) {
		forwardOptions.encryptor = options.encryptor;
		forwardOptions.decryptor = options.decryptor;
		forwardOptions.bucket = options.bucket;
	} else {
		forwardOptions.bucket = options;
	}
	forwardOptions.bucket = forwardOptions.bucket || sessionStorage;
	return new LocalStorageFFSCacheManager(options);
}

module.exports = SessionStorageFFSCacheManager;


/***/ }),

/***/ "./lib/cachemanagers/index.js":
/*!************************************!*\
  !*** ./lib/cachemanagers/index.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


module.exports = {
	MapFFSCacheManager: __webpack_require__(/*! ./MapFFSCacheManager */ "./lib/cachemanagers/MapFFSCacheManager.js"),
	CookieFFSCacheManager: __webpack_require__(/*! ./CookieFFSCacheManager */ "./lib/cachemanagers/CookieFFSCacheManager.js"),
	//KonfigerFFSCacheManager: require("./KonfigerFFSCacheManager"),
	KeyvRedisFFSCacheManager: __webpack_require__(/*! ./KeyvRedisFFSCacheManager */ "./lib/cachemanagers/KeyvRedisFFSCacheManager.js"),
	LocalStorageFFSCacheManager: __webpack_require__(/*! ./LocalStorageFFSCacheManager */ "./lib/cachemanagers/LocalStorageFFSCacheManager.js"),
	SessionStorageFFSCacheManager: __webpack_require__(/*! ./SessionStorageFFSCacheManager */ "./lib/cachemanagers/SessionStorageFFSCacheManager.js"),
};


/***/ }),

/***/ "./lib/connectors/http/xhrConnector.js":
/*!*********************************************!*\
  !*** ./lib/connectors/http/xhrConnector.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../../utils */ "./lib/utils.js");
const KFXMLHttpRequest = (__webpack_require__(/*! ../../helpers/node_classes */ "./lib/helpers/browser_classes.js").XMLHttpRequest);

function xhrConnector(config, httpInterceptor) {
	return new Promise(function makeRequest(resolvePromise, rejectPromise) {
		let reqData = config.data || null;
		let reqHeaders = config.headers || {};
		let headerNames = Object.keys(reqHeaders).reduce((acc, header) => {
			acc[header.toLowerCase()] = header;
			return acc;
		}, {});
		let responseType = config.responseType;
		httpInterceptor = httpInterceptor || (config.cache && config.cache.interceptor
			? config.cache.interceptor 
			: httpInterceptor);

		if (utils.isFormData(reqData) && headerNames['content-type']) {
			delete reqHeaders['content-type'];
		} else if ((utils.isPlainObject(reqData) || utils.isObject(reqData) || utils.isArray(reqData)) && !headerNames['content-type']) {
			reqHeaders['Content-Type'] = "application/json";
		}
		const preRequestResults = utils
			.invokeForEachInterceptorType(httpInterceptor, "HTTP_PRE_REQUEST", config)
			.filter(preRequestResult => preRequestResult.FROM_FFS_CACHE_MANAGER_INTERCEPTOR === true);
		if (preRequestResults.length > 0 && !config.refreshCache) {
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
			utils.invokeForEachInterceptorType(httpInterceptor, "HTTP_PRE_RESPONSE", config, response);
			response.body = responseData;
			if (req.status != 204 && config.responseType && config.responseType.toLowerCase().indexOf("json") != -1) {
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
			utils.invokeForEachInterceptorType(httpInterceptor, "HTTP_POST_RESPONSE", config, response);
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
			if (config.retry) {
				config.putInRetryQueue(config);
				let response = {
					status: 109,
					statusText: "Awaiting Retry",
					headers: [],
					config: config,
					request: req,
					isFromCache: false
				};
				utils.resolveResponse(response, resolvePromise, rejectPromise);
				return;
			};
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
		utils.invokeForEachInterceptorType(httpInterceptor, "HTTP_POST_REQUEST", config);
	});
}

module.exports = xhrConnector;


/***/ }),

/***/ "./lib/connectors/index.js":
/*!*********************************!*\
  !*** ./lib/connectors/index.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const wsConnector = __webpack_require__(/*! ./ws/wsConnector */ "./lib/connectors/ws/wsConnector.js");
const xhrConnector = __webpack_require__(/*! ./http/xhrConnector */ "./lib/connectors/http/xhrConnector.js");
const httpConnector = __webpack_require__(/*! ./http/httpConnector */ "./lib/connectors/http/xhrConnector.js");

module.exports = {
	wsConnector,
	xhrConnector,
	httpConnector
};


/***/ }),

/***/ "./lib/connectors/ws/wsConnector.js":
/*!******************************************!*\
  !*** ./lib/connectors/ws/wsConnector.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../../utils */ "./lib/utils.js");
const KFWebSocket = (__webpack_require__(/*! ../../helpers/node_classes */ "./lib/helpers/browser_classes.js").WebSocket);

function wsConnector(config, wsInterceptor) {
	const fullPath = utils.buildFullURLPath(config.baseURL, config.url);
	const absoluteUrl = utils.buildURL(fullPath, config.params, config.paramsSerializer);
	const socket = new KFWebSocket(absoluteUrl, config.protocol);

	socket.addEventListener('close', (e) => utils.invokeForEachInterceptorType(wsInterceptor, "WS_CLOSE", config, e));
	socket.addEventListener('error', (e) => utils.invokeForEachInterceptorType(wsInterceptor, "WS_ERROR", config, e));
	socket.addEventListener('message', (e) => utils.invokeForEachInterceptorType(wsInterceptor, "WS_MESSAGE", config, e));
	socket.addEventListener('open', (e) => utils.invokeForEachInterceptorType(wsInterceptor, "WS_OPEN", config, e));
	socket.implname = "wsConnector";

	return socket;
}

module.exports = wsConnector;


/***/ }),

/***/ "./lib/core/FuInterceptor.js":
/*!***********************************!*\
  !*** ./lib/core/FuInterceptor.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../utils */ "./lib/utils.js");

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

FuInterceptor.prototype.filter = function filter(cond, thisArg) {
	return this.handlers.filter(cond, thisArg);
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


/***/ }),

/***/ "./lib/core/FuQueueManager.js":
/*!************************************!*\
  !*** ./lib/core/FuQueueManager.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../utils */ "./lib/utils.js");
const FuInterceptor = __webpack_require__(/*! ./FuInterceptor */ "./lib/core/FuInterceptor.js");
const KyofuucHttp = __webpack_require__(/*! ./KyofuucHttp */ "./lib/core/KyofuucHttp.js");
const defaultRetryCache = utils.presentElseImport(typeof localStorage, 
	() => new (__webpack_require__(/*! ../cachemanagers/LocalStorageFFSCacheManager */ "./lib/cachemanagers/LocalStorageFFSCacheManager.js"))(null, null), 
	() => new (__webpack_require__(/*! ../cachemanagers/MapFFSCacheManager */ "./lib/cachemanagers/MapFFSCacheManager.js"))());

// This uses the stack data structure not queue, LIFO
function FuQueueManager(cache) {
    this._cache = cache || defaultRetryCache;
    this._interceptor = this._cache.interceptor || new FuInterceptor();
    this._entriesCount = this._cache.get({ key: "FUQUEUEMANAGER_ENTRIES_COUNT" }) || 0;
}

FuQueueManager.prototype.push = function push(object, type) {
    if (object === undefined) return;
    if (type && utils.isObject(object)) object.type = type;
    this._cache.set({
        key: `FUQUEUEMANAGER_ENTRY_${++this._entriesCount}`
    }, object);
    this._cache.set({ key: `FUQUEUEMANAGER_ENTRIES_COUNT` }, this._entriesCount);
    utils.forEach(utils.getGlobalEvent(utils.GLOBAL_EVENT_NAMES.EVENT_QUEUED), (cb) => cb(object.type, object));
}

FuQueueManager.prototype.pop = function pop() {
	if (this._entriesCount === 0) this._entriesCount = this._cache.get({ key: "FUQUEUEMANAGER_ENTRIES_COUNT" }) || 0;
    if (!this._entriesCount) return;
    const entryKey = `FUQUEUEMANAGER_ENTRY_${this._entriesCount}`;
    const data = this._cache.get({ key: entryKey });
    this._cache.remove({ key: entryKey });
    this._entriesCount--;
    if (!this._entriesCount) {
        this._cache.remove({ key: `FUQUEUEMANAGER_ENTRIES_COUNT` });
    } else {
        this._cache.set({ key: `FUQUEUEMANAGER_ENTRIES_COUNT` }, this._entriesCount);
    }
    return data;
}

// use global registered rebuilder function
// also use te defaults in ffs objects itself if resolvers not present
function rebuildRetryObject(config, ffs) {
    // if global resolver available, use instewad and return
    if (config._cacheName !== "") {
        config.cache = ffs.rebuildRetryObjectCache ? ffs.rebuildRetryObjectCache(config) : null;
        if (!config.cache) {
            switch (config._cacheName) {
                case "MapFFSCacheManager":
                    config.cache = new ffs.cachemanagers.MapFFSCacheManager();
                    break;
            }
        }
    }
    return config;
}

FuQueueManager.prototype.retry = function retry(type, ffs) {
    let entry;
    while ((entry = this.pop())) {
        if (entry.type !== type) continue;
        if (type === FuQueueManager.TYPE.HTTP_REQUEST) {
            (new ffs.KyofuucHttp()).request(rebuildRetryObject(entry.config, ffs))
            .then(response => {
                if (response.status != 109) {
                    utils.forEach(utils.getGlobalEvent(utils.GLOBAL_EVENT_NAMES.RETRY_SUCCESS), (cb) => cb(type, response));
                }
            }).catch(error => {
                utils.forEach(utils.getGlobalEvent(utils.GLOBAL_EVENT_NAMES.RETRY_FAILED), (cb) => cb(type, response));
            });
        }
    }
}

FuQueueManager.TYPE = {
    HTTP_REQUEST: "KYOFUUC_HTTP_REQUEST"
}

module.exports = FuQueueManager;


/***/ }),

/***/ "./lib/core/KyofuucHttp.js":
/*!*********************************!*\
  !*** ./lib/core/KyofuucHttp.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../utils */ "./lib/utils.js");
const defaults = __webpack_require__(/*! ../helpers/defaults */ "./lib/helpers/defaults.js");
const FuInterceptor = __webpack_require__(/*! ./FuInterceptor */ "./lib/core/FuInterceptor.js");
const FuQueueManager = __webpack_require__(/*! ./FuQueueManager */ "./lib/core/FuQueueManager.js");

function KyofuucHttp(httpBaseConfig) {
	this.httpBaseConfig = httpBaseConfig || {};
	this.httpInterceptor = this.httpBaseConfig.interceptor || new FuInterceptor();
	if (this.httpBaseConfig.cache && typeof this.httpBaseConfig.cache.registerInterceptors === 'function') {
		this.httpBaseConfig.cache.registerInterceptors(this.httpInterceptor);
	}
}

function putInRetryQueue(config) {
	const fuQueueManager = config.fuQueueManager || new FuQueueManager();
	config._retryCount = !utils.isNumber(config._retryCount) ? 1 : ++config._retryCount;
	if (!utils.isNumber(config.maxRetry)) {
		config.maxRetry = defaults.maxReconnectOrRetry;
	}
	if (config._retryCount > config.maxRetry) {
		utils.forEach(utils.getGlobalEvent(utils.GLOBAL_EVENT_NAMES.RETRY_MAXED_OUT), (cb) => cb(config));
		return;
	}
	config._cacheName = config.cache ? config.cache.constructor.name : "";
	fuQueueManager.push({
		type: "KYOFUUC_HTTP_REQUEST",
		config
	});
}

KyofuucHttp.prototype.request = function request(urlOrConfig, config) {
	if (typeof urlOrConfig === 'string') {
		config = config || {};
		config.url = urlOrConfig;
	} else {
		config = urlOrConfig || {};
	}
	let tempCache = config.cache;
	config = utils.mergeObject(config, this.httpBaseConfig);

	if (tempCache && tempCache.interceptorIds.length === 0) {
		tempCache.registerInterceptors(this.httpInterceptor);
	}
	if (config.retry) {
		config.putInRetryQueue = putInRetryQueue;
	}

	let promise;
	const connector = (config.connector || defaults.getDefaultHttpConnector());
	promise = connector(config, this.httpInterceptor);
	if (tempCache && tempCache.interceptorIds.length > 0) {
		tempCache.unRegisterInterceptors(this.httpInterceptor);
	}
	return promise;
}

KyofuucHttp.prototype.getUrl = function getUrl(config) {
	if (!config.url) {
		throw new Error("Invalid config url provider");
	}
	config = utils.mergeObject(config, this.httpBaseConfig);
	return utils.buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoPayload(method) {
	KyofuucHttp.prototype[method] = function (url, config) {
		return this.request(utils.mergeObject(config, {
			method,
			url,
			data: (config || {}).data
		}));
	}
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithPayload(method) {
	KyofuucHttp.prototype[method] = function (url, data, config) {
		if (!config) config = {};
		if (!config.headers) config.headers = {};
		if (!config.headers["accept"] && !config.headers["Accept"] && !config.headers["ACCEPT"]) {
			config.headers["Accept"] = "application/json, text/plain, */*";
		}
		return this.request(utils.mergeObject(config, {
			method,
			url,
			data
		}));
	}
});

module.exports = KyofuucHttp;



/***/ }),

/***/ "./lib/core/KyofuucWS.js":
/*!*******************************!*\
  !*** ./lib/core/KyofuucWS.js ***!
  \*******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../utils */ "./lib/utils.js");
const defaults = __webpack_require__(/*! ../helpers/defaults */ "./lib/helpers/defaults.js");
const FuInterceptor = __webpack_require__(/*! ./FuInterceptor */ "./lib/core/FuInterceptor.js");

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
		//instance.state = cachedState; // test cached state
		instance.state = 1;
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
	//console.log("PROTOCOL", this.protocol)
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

KyofuucWS.prototype.getUrl = function getUrl(config) {
	config = config || this.wsConfig;
	if (!config.url) {
		throw new Error("Invalid config url provider");
	}
	config = utils.mergeObject(config, this.httpBaseConfig);
	return utils.buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
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


/***/ }),

/***/ "./lib/helpers/browser_classes.js":
/*!****************************************!*\
  !*** ./lib/helpers/browser_classes.js ***!
  \****************************************/
/***/ ((module) => {



module.exports = {
    WebSocket,
    http: null,
    https: null,
    XMLHttpRequest,
};



/***/ }),

/***/ "./lib/helpers/defaults.js":
/*!*********************************!*\
  !*** ./lib/helpers/defaults.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



const utils = __webpack_require__(/*! ../utils */ "./lib/utils.js");
const classes = __webpack_require__(/*! ../helpers/node_classes */ "./lib/helpers/browser_classes.js");
//const FuQueueManager = require('../core/FuQueueManager');

const maxReconnectOrRetry = 99999;

function getDefaultHttpConnector() {
	let connector;
	if (typeof XMLHttpRequest !== 'undefined') { 
		connector = __webpack_require__(/*! ../connectors/http/xhrConnector */ "./lib/connectors/http/xhrConnector.js");
	} else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
		connector = __webpack_require__(/*! ../connectors/http/httpConnector */ "./lib/connectors/http/xhrConnector.js");
	}
	return connector;
}

function getDefaultWSConnector() {
	let connector = __webpack_require__(/*! ../connectors/ws/wsConnector */ "./lib/connectors/ws/wsConnector.js");
	return connector;
}

function getHttpAgent() {
	if (utils.envIsNodeJs() && classes.http) {
		return {
			httpAgent: new classes.http.Agent({ keepAlive: true }),
			httpsAgent: new classes.https.Agent({ keepAlive: true }),
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


/***/ }),

/***/ "./lib/kyofuuc.js":
/*!************************!*\
  !*** ./lib/kyofuuc.js ***!
  \************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const KyofuucHttp = __webpack_require__(/*! ./core/KyofuucHttp */ "./lib/core/KyofuucHttp.js");
const KyofuucWS = __webpack_require__(/*! ./core/KyofuucWS */ "./lib/core/KyofuucWS.js");
const FuInterceptor = __webpack_require__(/*! ./core/FuInterceptor */ "./lib/core/FuInterceptor.js");
const FuQueueManager = __webpack_require__(/*! ./core/FuQueueManager */ "./lib/core/FuQueueManager.js");
const connectors = __webpack_require__(/*! ./connectors/index */ "./lib/connectors/index.js");
const cachemanagers = __webpack_require__(/*! ./cachemanagers/index */ "./lib/cachemanagers/index.js");
const defaults = __webpack_require__(/*! ./helpers/defaults */ "./lib/helpers/defaults.js");
const utils = __webpack_require__(/*! ./utils */ "./lib/utils.js");

function init(config) {
	const queueManager = (config || {}).fuQueueManager || new FuQueueManager();
	if (config && config.httpConfig && !config.httpConfig.fuQueueManager) config.httpConfig.fuQueueManager = queueManager;
	const httpConfig = ((config.httpConfig || config) || defaults.httpConfig);
	const wsConfig = ((config.wsConfig || config) || defaults.wsConfig);

	if (!httpConfig.responseType) httpConfig.responseType = defaults.httpConfig.responseType;
	if (!httpConfig.validateStatus) httpConfig.validateStatus = defaults.httpConfig.validateStatus;

	const kfHTTP = new KyofuucHttp(httpConfig);
	const kfWS = new KyofuucWS(wsConfig);
	kfHTTP.kfWS = kfWS;
	kfHTTP.queueManager = queueManager;
	kfHTTP.ws = (p1, p2) => kfHTTP.kfWS.ws(p1, p2);
	return kfHTTP;
	//return utils.mergeClasses(kfHTTP, kfWS);
}

function retryHttpRequests(queueManager, ffs) {
	if (!queueManager) return;
	queueManager.retry("KYOFUUC_HTTP_REQUEST", ffs);
}

const ffs = init(defaults.httpConfig);

// add the core classes 
ffs.KyofuucWS = KyofuucWS;
ffs.KyofuucHttp = KyofuucHttp;
ffs.FuInterceptor = FuInterceptor;

// add defaults
ffs.defaults = defaults;

// add the utils 
ffs.utils = utils;
ffs.init = init;
ffs.retryHttpRequests = retryHttpRequests;
ffs.retryRequests = () => {
	retryHttpRequests(ffs.queueManager, ffs);
};

// add the cache managers 
ffs.cachemanagers = cachemanagers;
ffs.connectors = connectors;

module.exports = ffs;
module.exports["default"] = ffs;


/***/ }),

/***/ "./lib/utils.js":
/*!**********************!*\
  !*** ./lib/utils.js ***!
  \**********************/
/***/ ((module) => {

"use strict";



const VERSION = "0.0.1";

const ERROR_CODES = {
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
	REQUEST_FAILED: "ERR_REQUEST_FAILED",
	MAXCONTENTLENGTH_EXCEEDED: "ERR_MAXCONTENTLENGTH_EXCEEDED",
	REQUEST_ABORTED: "ERR_REQUEST_ABORTED",
	STREAM_ERROR: "ERR_STREAM_ERROR",
	ERR_PROCESSING_DATA: "ERR_PROCESSING_DATA",
	ERR_PROCESSING_BODY_AS_JSON_DATA: "ERR_PROCESSING_BODY_AS_JSON_DATA",
	MAX_REDIRECT_ERROR: "MAX_REDIRECT_ERROR",
	CONNECTION_ABORTED: "ECONNABORTED",
	NETWORK_ERROR: "NETWORK_ERROR",
	TIMEOUT_ERROR: "TIMEOUT_ERROR"
};

const GLOBAL_EVENT_NAMES = {
	RETRY_MAXED_OUT: "FQM_RETRY_MAXED_OUT",
	RETRY_SUCCESS: "FQM_RETRY_SUCCESS",
	RETRY_FAILED: "FQM_RETRY_FAILED",
	EVENT_QUEUED: "FQM_EVENT_QUEUED"
}

const _globalEvents = {};

JSON.safeStringify = (obj, indent = 2) => {
	let cache = [];
	const retVal = JSON.stringify(
	  obj,
	  (key, value) =>
		typeof value === "object" && value !== null
		  ? cache.includes(value)
			? "[Circular]" // Duplicate reference found, discard key
			: cache.push(value) && value // Store value in our collection
		  : value,
	  indent
	);
	cache = null;
	return retVal;
};

function isString(val) {
	return typeof val === 'string';
}

function isArray(val) {
	return Array.isArray(val);
}

function isFormData(val) {
	return toString.call(val) === '[object FormData]';
}

function isObject(val) {
	return val !== null && typeof val === 'object';
}

function isNumber(val) {
	return typeof val === 'number';
}

function isPlainObject(val) {
	if (toString.call(val) !== '[object Object]') {
		return false;
	}
  
	let prototype = Object.getPrototypeOf(val);
	return prototype === null || prototype === Object.prototype;
}

function isFunction(val) {
	return toString.call(val) === '[object Function]';
}

function isDate(val) {
	return toString.call(val) === '[object Date]';
}

function isStream(val) {
	return isObject(val) && isFunction(val.pipe);
}

function isArrayBuffer(val) {
	return toString.call(val) === '[object ArrayBuffer]';
}

function isUndefined(val) {
	return typeof val === 'undefined';
}

function stripBOM(content) {
	if (content.charCodeAt(0) === 0xFEFF) {
		content = content.slice(1);
	}
	return content;
}

function forEach(obj, fn) {
	if (obj === null || typeof obj === 'undefined') {
		return;
	}
	if (typeof obj !== 'object') {
		obj = [obj];
	}
  
	if (isArray(obj)) {
		for (var i = 0, l = obj.length; i < l; i++) {
			fn.call(null, obj[i], i, obj);
		}
	} else {
		for (var key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
			  fn.call(null, obj[key], key, obj);
			}
		}
	}
}

function mergeObject(obj1, obj2) {
	obj1 = obj1 || {};
	obj2 = obj2 || {};
	if ((obj1 === null || typeof obj1 === 'undefined') && 
		(obj2 === null || typeof obj2 === 'undefined')) {
		return {};
	}
	let merged = {};
	if (typeof obj1 !== 'object' && typeof obj2 === 'object') {
		merged = obj2;
		return merged;
	}
	if (typeof obj2 !== 'object') {
		merged = obj1;
		return merged;
	}
	for (var key in obj1) { merged[key] = obj1[key]; }
	for (var key in obj2) {
		if (merged[key] === undefined || merged[key] === null) {
			merged[key] = obj2[key];
		}
	}
	return merged;
}

function invokeForEachInterceptorType(interceptor, type, config, res) {
	const responses = [];
	if (!interceptor) return responses;
	forEach(interceptor.filter(h => h && h.type === type), function iterateHandler(handler) {
		if (!handler || !handler.cb) return;
		if (typeof handler.when === 'function' && handler.when(config) === false) return;
		const response = handler.cb(handler.options, config, res);
		if (response !== undefined) responses.push(response);
	});
	return responses;
}

function isURLSearchParams(val) {
	return toString.call(val) === '[object URLSearchParams]';
}

function encodeParamURI(val) {
	return encodeURIComponent(val).
		replace(/%5B/gi, '[').
		replace(/%5D/gi, ']').
		replace(/%3A/gi, ':').
		replace(/%24/g, '$').
		replace(/%20/g, '+').
		replace(/%2C/gi, ',');
}

function buildURL(url, params, serializer) {
	if (!params) {
		return url;
	}

	let formatedParams;
	if (isURLSearchParams(params)) {
		formatedParams = params.toString();
	} else if (serializer) {
		formatedParams = serializer(params);
	} else {
		let paramsParts = [];
		forEach(params, function serialize(value, key) {
			if (value === null || typeof value === 'undefined') {
				return;
			}

			if (isArray(value)) {
				key = key + '[]';
			} else {
				value = [value];
			}
		
			forEach(value, function parseValue(val) {
				if (isDate(val)) {
					val = val.toISOString();
				} else if (isObject(val)) {
					val = JSON.stringify(val);
				}
				paramsParts.push(`${encodeParamURI(key)}=${encodeParamURI(val)}`);
			});
			formatedParams = paramsParts.join('&');
		});

	}

	if (formatedParams) {
		var hashIndex = url.indexOf('#');
		if (hashIndex !== -1) {
			url = url.slice(0, hashIndex);
		}

		url += (url.indexOf('?') === -1 ? '?' : '&') + formatedParams;
	}
	return url;
}

function envIsBrowser() {
	return !(typeof window === 'undefined');
}

function envIsNodeJs() {
	return (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]');
}

function envIsStandardBrowser() {
	if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
			navigator.product === 'NativeScript' ||
			navigator.product === 'NS')) {
	  return false;
	}
	return (typeof window !== 'undefined' && typeof document !== 'undefined');
}

function kyofuucError(message, config, code, request, response) {
	let error = isString(message) ? new Error(message) : message;
	error.config = config;
	if (code) {
		error.code = code;
	}
	error.request = request;
	error.response = response;
	error.isKyofuucError = true;
	
	error.toJSON = function toJSON() {
		return {
			name: this.name,
			message: this.message,
			description: this.description,
			number: this.number,
			fileName: this.fileName,
			lineNumber: this.lineNumber,
			columnNumber: this.columnNumber,
			stack: this.stack,
			config: this.config,
			code: this.code,
			status: (this.response && this.response.status ? this.response.status : null),
			responseBody: (this.response && this.response.body ? this.response.body : null)
		};
	};
	return error;
}

function isAbsoluteURL(url) {
	return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

function isRelativeURL(url) {
	return !isAbsoluteURL(url);
}

function combineURLs(baseURL, relativeURL) {
	return relativeURL
		? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
		: baseURL;
}

function buildFullURLPath(baseURL, requestURL) {
	if (baseURL && !isAbsoluteURL(requestURL)) {
		return combineURLs(baseURL, requestURL);
	}
	return requestURL;
}

function mergeClassPrototypes(baseClazz, joinClazz) {
	forEach(joinClazz.constructor.prototype || [], function iterateDecl(methodDecl, methodName) {
		if (!(methodName in baseClazz.constructor.prototype)) {
			baseClazz.constructor.prototype[methodName] = methodDecl;
		}
	});
}

function mergeClassAttribute(baseClazz, joinClazz) {
	forEach(joinClazz || {}, function iterateDecl(attribute, name) {
		let oldValue = baseClazz[name];
		if (oldValue) {
			if (isObject(oldValue)) {
				baseClazz[name] = mergeObject(oldValue, attribute);
			} else if (isArray(oldValue)) {

			}
		} else {
			baseClazz[name] = attribute;
		}
	})
}

function mergeClasses(...classes) {
	const baseClazz = classes[0];
	forEach(classes, function iterateClass(clazz, index) {
		if (index == 0) return;
		mergeClassAttribute(baseClazz, clazz);
		mergeClassPrototypes(baseClazz, clazz);
	});
	return baseClazz;
}

function resolveResponse(response, resolve, reject) {
	let validateStatus = response.config.validateStatus;
	if (!response.status || !validateStatus || validateStatus(response.status)) {
		resolve(response);
	} else {
		reject(kyofuucError(
			'Request failed with status code ' + response.status,
			response.config,
			ERROR_CODES.REQUEST_FAILED,
			response.request,
			response
		));
	}
}

function buildCacheKey(config) {
	return config.key || config.url + (config.isResource 
		? `_${(config.method || "GET").toUpperCase()}_RESOURCE` 
		: `_${(config.method || "GET").toUpperCase()}_SINGLE`);
}

let ignoreDuplicateOf = [
	'age', 'authorization', 'content-length', 'content-type', 'etag',
	'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
	'last-modified', 'location', 'max-forwards', 'proxy-authorization',
	'referer', 'retry-after', 'user-agent'
];

function trim(str) {
	return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

function parseHeaders(headers) {
	var parsed = {};
	var key;
	var val;
	var i;
  
	if (!headers) { return parsed; }
  
	forEach(headers.split('\n'), function parser(line) {
	  i = line.indexOf(':');
	  key = trim(line.substr(0, i)).toLowerCase();
	  val = trim(line.substr(i + 1));
  
	  if (key) {
		if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
		  return;
		}
		if (key === 'set-cookie') {
		  parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
		} else {
		  parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
		}
	  }
	});
  
	return parsed;
};

function toBase64(value) {
	if (envIsBrowser()) {
		return btoa(value);
	}
	return Buffer.from(value).toString('base64');
}

function fromBase64(value) {
	if (envIsBrowser()) {
		return atob(value);
	}
	return Buffer.from(value, 'base64').toString();
}

function isURLSameOrigin(url) {
	return false;
}

function presentElseImport(item, actual, fallback) {
	if (item !== "undefined") return actual.call();
	else return fallback.call();
}

function cloneInstance(instance) {
	return Object.assign(Object.create(Object.getPrototypeOf(instance)), instance);
}

// global event listeners

function registerGlobalEvent(key, event) {
	if (!_globalEvents[key]) _globalEvents[key] = [];
	_globalEvents[key].push(event);
	return _globalEvents.length - 1;
}

function unRegisterGlobalEvent(key, index) {
	if (!_globalEvents[key] || !_globalEvents[key].length) return;
	_globalEvents[key].splice(index, 1);
}

function getGlobalEvent(key) {
	return _globalEvents[key] || [];
}

const registerQueuedEvent = (event) => registerGlobalEvent(GLOBAL_EVENT_NAMES.EVENT_QUEUED, event);
const registerRetryFailureEvent = (event) => registerGlobalEvent(GLOBAL_EVENT_NAMES.RETRY_FAILED, event);
const registerRetrySuccessEvent = (event) => registerGlobalEvent(GLOBAL_EVENT_NAMES.RETRY_SUCCESS, event);
const registerRetryMaxedOutEvent = (event) => registerGlobalEvent(GLOBAL_EVENT_NAMES.RETRY_MAXED_OUT, event);

module.exports = {
	trim,
	isDate,
	VERSION,
	forEach,
	isArray,
	toBase64,
	stripBOM,
	buildURL,
	isNumber,
	isStream,
	isString,
	isObject,
	fromBase64,
	isFormData,
	isFunction,
	envIsNodeJs,
	mergeObject,
	combineURLs,
	ERROR_CODES,
	isUndefined,
	mergeClasses,
	envIsBrowser,
	parseHeaders,
	kyofuucError,
	isPlainObject,
	isAbsoluteURL,
	isRelativeURL,
	isArrayBuffer,
	buildCacheKey,
	cloneInstance,
	encodeParamURI,
	getGlobalEvent,
	isURLSameOrigin,
	resolveResponse,
	buildFullURLPath,
	isURLSearchParams,
	presentElseImport,
	GLOBAL_EVENT_NAMES,
	registerQueuedEvent,
	registerGlobalEvent,
	mergeClassAttribute,
	mergeClassPrototypes,
	envIsStandardBrowser,
	unRegisterGlobalEvent,
	registerRetrySuccessEvent,
	registerRetryFailureEvent,
	registerRetryMaxedOutEvent,
	invokeForEachInterceptorType
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./index.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=kyofuuc.map