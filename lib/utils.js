
'use strict';

function isArray(val) {
    return Array.isArray(val);
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

function invokeForEachInterceptorType(interceptor, type, config) {
	let response;
	forEach(interceptor.filter(h => h.type === type), function(handler) {
		if (typeof handler.when === 'function' && interceptor.when(config) === false) return;
		response = handler.cb(handler.options, config) || response;
	});
	return response;
}

module.exports = {
    isArray,
    forEach,
	mergeObject,
	invokeForEachInterceptorType
};
