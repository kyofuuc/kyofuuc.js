
'use strict';

const LocalStorageFFSCacheManager = require('./LocalStorageFFSCacheManager');

function SessionStorageFFSCacheManager(interceptor, encryptor, decryptor, localStorageImpl) {
	return new LocalStorageFFSCacheManager(interceptor, encryptor, decryptor, (localStorageImpl || sessionStorage));
}

module.exports = SessionStorageFFSCacheManager;
