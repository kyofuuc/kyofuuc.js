
'use strict';

const VERSION = "0.0.1"

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
	const merged = {};
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
			status: (this.response && this.response.status ? this.response.status : null)
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
	isURLSameOrigin,
	resolveResponse,
	buildFullURLPath,
	isURLSearchParams,
	presentElseImport,
	mergeClassAttribute,
	mergeClassPrototypes,
	envIsStandardBrowser,
	invokeForEachInterceptorType
};
