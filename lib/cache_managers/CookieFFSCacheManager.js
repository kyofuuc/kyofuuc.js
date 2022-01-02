
'use strict';


// example 2 days = ((2) *24*60*60*1000)
function setCookie(cookiesImpl, name, value, expiryInMilliSeconds) {
    let expires = "";
    if (expiryInMilliSeconds) {
        let date = new Date();
        date.setTime(date.getTime() + (expiryInMilliSeconds));
        expires = "; expires=" + date.toUTCString();
    }
	if (cookiesImpl) {
		cookiesImpl.setItem(name, JSON.stringify({
			name,
			expires,
			value,
			path: "/"
		}))
	} else {
		document.cookie = name + "=" + (value || "")  + expires + "; path=/";
	}
}

function getCookie(cookiesImpl, name) {
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

function invalidateCookie(cookiesImpl, name) {   
	if (cookiesImpl) {
		cookiesImpl.removeItem(name);
		return;
	}
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function CookieFFSCacheManager(encryptor, decryptor, expiryInMilliSeconds, cookiesImpl) {
	this.interceptorIds = [];
	this.encryptor = encryptor;
	this.decryptor = decryptor;
	this.cookiesImpl = cookiesImpl;
	this.expiryInMilliSeconds = expiryInMilliSeconds;
}

CookieFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
	if (!interceptor) return;
	let cookiesImpl = this.cookiesImpl;
	let expiryInMilliSeconds = this.expiryInMilliSeconds;
	const preInterceptorId = interceptor.registerPreRequest(function(options, config) {
		if (!config.cache || config.refreshCache) return;
		config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
		let cachedValue = getCookie(cookiesImpl, config.key);
		if (cachedValue && config.refreshCache) invalidateCookie(cookiesImpl, config.key);
		return (typeof options.encryptor === 'function') ? options.decryptor(cachedValue, options) : cachedValue;
	}, {
		decryptor: this.decryptor
	});
	this.interceptorIds.push(preInterceptorId);

	const postInterceptorId = interceptor.registerPreResponse(function(options, config) {
		if (!config.cache) return;
		if (config.response) {
			config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
			let encryptedResponse = (typeof options.encryptor === 'function') ? options.encryptor(config.response, options) : config.response;
			setCookie(cookiesImpl, config.key, encryptedResponse, expiryInMilliSeconds);
		}
	}, {
		encryptor: this.encryptor
	});
	this.interceptorIds.push(postInterceptorId);
}

CookieFFSCacheManager.prototype.unRegisterInterceptors = function unRegisterInterceptors(interceptor) {
	for (let interceptorId of this.interceptorIds) {
		interceptor.unRegister(interceptorId);
	}
}

module.exports = CookieFFSCacheManager;
