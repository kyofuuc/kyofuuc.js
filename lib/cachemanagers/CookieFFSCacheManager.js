
'use strict';

const utils = require("../utils");

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
function CookieFFSCacheManager(encryptor, decryptor, expiryInMilliSeconds, cookiesImpl) {
    this.interceptorIds = [];
    this.encryptor = encryptor;
    this.decryptor = decryptor;
	this.interceptor = undefined;
    this.cookiesImpl = cookiesImpl;
    this.expiryInMilliSeconds = expiryInMilliSeconds || (cookiesImpl ? null : ((1) *24*60*60*1000)); 
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

    const postInterceptorId = interceptor.registerPreResponse(function cookieFFSCMPResInterceptor(options, config, response) {
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
	value = JSON.stringify({ value });
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
