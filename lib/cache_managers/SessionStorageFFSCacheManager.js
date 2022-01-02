
'use strict';

const LocalStorageFFSCacheManager = require('./LocalStorageFFSCacheManager');

function SessionStorageFFSCacheManager(encryptor, decryptor, sessionStorageImpl) {
	return new LocalStorageFFSCacheManager(encryptor, decryptor, (sessionStorageImpl || sessionStorage));
}

module.exports = SessionStorageFFSCacheManager;
