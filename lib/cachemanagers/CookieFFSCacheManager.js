
'use strict';


// example 2 days = ((2) *24*60*60*1000)
function ffCMSetCookie(cookiesImpl, name, value, expiryInMilliSeconds, options) {
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
    this.cookiesImpl = cookiesImpl;
    this.expiryInMilliSeconds = expiryInMilliSeconds || (cookiesImpl ? null : ((1) *24*60*60*1000)); 
}

CookieFFSCacheManager.prototype.registerInterceptors = function registerInterceptors(interceptor) {
    if (!interceptor) return;
    let cookiesImpl = this.cookiesImpl;
    let expiryInMilliSeconds = this.expiryInMilliSeconds;
    const preInterceptorId = interceptor.registerPreRequest(function cookieFFSCMPReqInterceptor(options, config) {
        if (!config.cache || config.refreshCache) return;
        config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
        let cachedValue = ffCMGetCookie(cookiesImpl, config.key);
        if (cachedValue && config.refreshCache) ffCMInvalidateCookie(cookiesImpl, config.key);
		cachedValue = (typeof options.encryptor === 'function') ? options.decryptor(cachedValue, options) : cachedValue;
		if (cachedValue === undefined) return;
		return {
			FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
			key: config.key,
			value: cachedValue
		};
    }, {
        decryptor: this.decryptor
    });
    this.interceptorIds.push(preInterceptorId);

    const postInterceptorId = interceptor.registerPreResponse(function cookieFFSCMPResInterceptor(options, config, response) {
        if (!config.cache) return;
        if (response) {
            config.key = config.key || config.url + (config.isResource ? "_RESOURCE" : "_SINGLE");
            let encryptedResponse = (typeof options.encryptor === 'function') ? options.encryptor(response, options) : response;
            let cacheOptions = config.cacheOptions || {};
			if (cacheOptions.Secure === undefined) cacheOptions.Secure = true;
			ffCMSetCookie(cookiesImpl, config.key, encryptedResponse, expiryInMilliSeconds, cacheOptions);
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
