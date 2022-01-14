
const utils = require('../lib/utils');
const KFLocalStorageImpl = utils.presentElseImport(typeof localStorage, 
	() => localStorage, 
	() => {
		const localStorageImpl = {};
		localStorageImpl.getItem = function getItem(key) {
			return localStorageImpl[key];
		};
		localStorageImpl.setItem = function setItem(key, value) {
			localStorageImpl[key] = value;
		};
		localStorageImpl.removeItem = function removeItem(key) {
			delete localStorageImpl[key];
		};
		return localStorageImpl;
	});

const assert = require('assert');
const FuInterceptor = require('../lib/core/FuInterceptor');
const MapFFSCacheManager = require('../lib/cachemanagers/MapFFSCacheManager');
const CookieFFSCacheManager = require('../lib/cachemanagers/CookieFFSCacheManager');
const LocalStorageFFSCacheManager = require('../lib/cachemanagers/LocalStorageFFSCacheManager');
const SessionStorageFFSCacheManager = require('../lib/cachemanagers/SessionStorageFFSCacheManager');

function decryptor(value, config) {
	return Buffer.from(value, 'base64').toString('ascii');
}

function encryptor(value, config) {
	return Buffer.from(value).toString('base64');
}

it('*FFSCacheManager TODO', () => {
	console.log("TEST REMOVAL OF INTERCEPTORS FROM FuInterceptor using *.interceptorIds");
});

it('MapFFSCacheManager test', () => {
	const map = { user: "thecarisma" };
	const fuInterceptor = new FuInterceptor();
	const mapFFSCacheManager = new MapFFSCacheManager(map);
	mapFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "POST_RESPONSE", { cache: mapFFSCacheManager }, { status: 200 }), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), [{
		FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
		key: "undefined_GET_SINGLE",
		value: { status: 200 }
	}]);

	assert.deepEqual(map, { user: "thecarisma", undefined_GET_SINGLE: JSON.safeStringify({
		value: { status: 200 }
	})});
	assert.deepEqual(map.user, "thecarisma");
	assert.deepEqual(map.undefined_GET_SINGLE, JSON.safeStringify({ value: { status: 200 } }));
	mapFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(mapFFSCacheManager.get({ key: "undefined_GET_SINGLE" }), { status: 200 });
	assert.deepEqual(mapFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	mapFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(mapFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	assert.deepEqual(mapFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('MapFFSCacheManager test Alt', () => {
	const fuInterceptor = new FuInterceptor();
	const mapFFSCacheManager = new MapFFSCacheManager();
	mapFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "POST_RESPONSE", { cache: mapFFSCacheManager }, { status: 200 }), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), [{
		FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
		key: "undefined_GET_SINGLE",
		value: { status: 200 }
	}]);
	mapFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(mapFFSCacheManager.get({ key: "undefined_GET_SINGLE" }), { status: 200 });
	assert.deepEqual(mapFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	mapFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(mapFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	assert.deepEqual(mapFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('LocalStorageFFSCacheManager test', () => {
	const fuInterceptor = new FuInterceptor();
	KFLocalStorageImpl.removeItem("undefined_GET_SINGLE");
	const lsFFSCacheManager = new LocalStorageFFSCacheManager(null, null, KFLocalStorageImpl);
	lsFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "POST_RESPONSE", { cache: lsFFSCacheManager }, { status: 200 }), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), [{
		FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
		key: "undefined_GET_SINGLE",
		value: { status: 200 }
	}]);
	assert.deepEqual(KFLocalStorageImpl.getItem("undefined_GET_SINGLE"), JSON.safeStringify({ value: { status: 200 } }));
	lsFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(lsFFSCacheManager.get({ key: "undefined_GET_SINGLE" }), { status: 200 });
	assert.deepEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	lsFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	assert.deepEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('LocalStorageFFSCacheManager test with encryptor and decryptor', () => {
	const fuInterceptor = new FuInterceptor();
	KFLocalStorageImpl.removeItem("undefined_GET_SINGLE");
	const lsFFSCacheManager = new LocalStorageFFSCacheManager(encryptor, decryptor, KFLocalStorageImpl);
	lsFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "POST_RESPONSE", { cache: lsFFSCacheManager }, { status: 200 }), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), [{
		FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
		key: "undefined_GET_SINGLE",
		value: { status: 200 }
	}]);
	assert.deepEqual(KFLocalStorageImpl.getItem("undefined_GET_SINGLE"), encryptor(JSON.safeStringify({ value: { status: 200 } })));
	lsFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(lsFFSCacheManager.get({ key: "undefined_GET_SINGLE" }), { status: 200 });
	assert.deepEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	lsFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	assert.deepEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('SessionStorageFFSCacheManager test', () => {
	const fuInterceptor = new FuInterceptor();
	KFLocalStorageImpl.removeItem("undefined_GET_SINGLE");
	const ssFFSCacheManager = new SessionStorageFFSCacheManager(null, null, KFLocalStorageImpl);
	ssFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "POST_RESPONSE", { cache: ssFFSCacheManager }, { status: 200 }), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), [{
		FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
		key: "undefined_GET_SINGLE",
		value: { status: 200 }
	}]);
	assert.deepEqual(KFLocalStorageImpl.getItem("undefined_GET_SINGLE"), JSON.safeStringify({ value: { status: 200 } }));
	ssFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(ssFFSCacheManager.get({ key: "undefined_GET_SINGLE" }), { status: 200 });
	assert.deepEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	ssFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	assert.deepEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('SessionStorageFFSCacheManager test with encryptor and decryptor', () => {
	const fuInterceptor = new FuInterceptor();
	KFLocalStorageImpl.removeItem("undefined_GET_SINGLE");
	const ssFFSCacheManager = new SessionStorageFFSCacheManager(encryptor, decryptor, KFLocalStorageImpl);
	ssFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "POST_RESPONSE", { cache: ssFFSCacheManager }, { status: 200 }), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), [{
		FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
		key: "undefined_GET_SINGLE",
		value: { status: 200 }
	}]);
	assert.deepEqual(KFLocalStorageImpl.getItem("undefined_GET_SINGLE"), encryptor(JSON.safeStringify({ value: { status: 200 } })));
	ssFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(ssFFSCacheManager.get({ key: "undefined_GET_SINGLE" }), { status: 200 });
	assert.deepEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	ssFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	assert.deepEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('CookieFFSCacheManager test', () => {
	const fuInterceptor = new FuInterceptor();
	KFLocalStorageImpl.removeItem("undefined_GET_SINGLE");
	const cookieFFSCacheManager = new CookieFFSCacheManager(null, null, null, KFLocalStorageImpl);
	cookieFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "POST_RESPONSE", { cache: cookieFFSCacheManager }, { status: 200 }), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), []);
	assert.deepEqual(KFLocalStorageImpl.getItem("undefined_GET_SINGLE"), JSON.safeStringify({ value: { status: 200 } }));
	cookieFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(cookieFFSCacheManager.get({ key: "undefined_GET_SINGLE" }), { status: 200 });
	assert.deepEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	cookieFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	assert.deepEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('CookieFFSCacheManager test with encryptor and decryptor', () => {
	const fuInterceptor = new FuInterceptor();
	KFLocalStorageImpl.removeItem("undefined_GET_SINGLE");
	const cookieFFSCacheManager = new CookieFFSCacheManager(encryptor, decryptor, null, KFLocalStorageImpl);
	cookieFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "POST_RESPONSE", { cache: cookieFFSCacheManager }, { status: 200 }), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), []);
	assert.deepEqual(KFLocalStorageImpl.getItem("undefined_GET_SINGLE"), encryptor(JSON.safeStringify({ value: { status: 200 } })));
	cookieFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(cookieFFSCacheManager.get({ key: "undefined_GET_SINGLE" }), { status: 200 });
	assert.deepEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	cookieFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), JSON.safeStringify({
		name: "test.com_SINGLE",
		expires: "",
		value: { status: 300 },
		path: "/"
	}));
	assert.deepEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('KonfigerFFSCacheManager test', () => {
});

it('KeyvRedisFFSCacheManager test', () => {
});

