
'use strict';

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

function isDate(val) {
	return toString.call(val) === '[object Date]';
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
	forEach(interceptor.filter(h => h.type === type), function iterateHandler(handler) {
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

module.exports = {
	isDate,
	forEach,
	isArray,
	buildURL,
	isNumber,
	isString,
	isObject,
	isFormData,
	mergeObject,
	isPlainObject,
	encodeParamURI,
	isURLSearchParams,
	invokeForEachInterceptorType
};
