
'use strict';

const VERSION = "0.0.1"

const ERROR_CODES = {
	UNKNOWN_ERROR: "UNKNOWN_ERROR"
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
	if ((obj1 === null || typeof obj1 === 'undefined') || 
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
	forEach(interceptor.filter(h => h && h.type === type), function iterateHandler(handler) {
		if (!handler || !handler.cb) return;
		if (typeof handler.when === 'function' && interceptor.when(config) === false) return;
		const response = handler.cb(handler.options, config, res)
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

function kyofuucError(message, config, errorCode, request, response) {
	let error = new Error(message);
	
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
			errorCode: this.errorCode,
			status: (this.response && this.response.status ? this.response.status : null)
		};
	};
	return error;
}

module.exports = {
	isDate,
	VERSION,
	forEach,
	isArray,
	buildURL,
	isNumber,
	isStream,
	isString,
	isObject,
	isFormData,
	isFunction,
	mergeObject,
	ERROR_CODES,
	kyofuucError,
	isPlainObject,
	isArrayBuffer,
	encodeParamURI,
	isURLSearchParams,
	invokeForEachInterceptorType
};
