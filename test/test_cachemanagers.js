
try {
	localStorage.setItem("FFS_TEST_CACHE_MANAGE", "TEST");
	localStorage.removeItem("FFS_TEST_CACHE_MANAGE");
} catch(e) {
	var localStorage = {};
	localStorage.getItem = function getItem(key) {
		return localStorage[key];
	};
	localStorage.setItem = function setItem(key, value) {
		localStorage[key] = value;
	};
	localStorage.removeItem = function removeItem(key) {
		delete localStorage[key];
	};
}

const assert = require('assert');
const utils = require('../lib/utils');
const FuInterceptor = require('../lib/core/FuInterceptor');
const MapFFSCacheManager = require('../lib/cachemanagers/MapFFSCacheManager');
const CookieFFSCacheManager = require('../lib/cachemanagers/CookieFFSCacheManager');
const LocalStorageFFSCacheManager = require('../lib/cachemanagers/LocalStorageFFSCacheManager');
const SessionStorageFFSCacheManager = require('../lib/cachemanagers/SessionStorageFFSCacheManager');

function decryptor(value, config) {
	return Buffer.from(value).toString('base64');
}

function encryptor(value, config) {
	return Buffer.from(value, 'base64').toString('ascii');
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
		key: "undefined_SINGLE",
		value: { status: 200 }
	}]);

	assert.deepEqual(map, { user: "thecarisma", undefined_SINGLE: { status: 200 } });
	assert.deepEqual(map.user, "thecarisma");
	assert.deepEqual(map.undefined_SINGLE, { status: 200 });
	mapFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(mapFFSCacheManager.get({ key: "undefined_SINGLE" }), { status: 200 });
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
		key: "undefined_SINGLE",
		value: { status: 200 }
	}]);
	mapFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(mapFFSCacheManager.get({ key: "undefined_SINGLE" }), { status: 200 });
	assert.deepEqual(mapFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	mapFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(mapFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	assert.deepEqual(mapFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('LocalStorageFFSCacheManager test', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const lsFFSCacheManager = new LocalStorageFFSCacheManager(null, null, localStorage);
	lsFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: lsFFSCacheManager }, "{ status: 200 }"), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), [{
		FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
		key: "undefined_SINGLE",
		value: "{ status: 200 }"
	}]);
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), "{ status: 200 }");
	lsFFSCacheManager.set({ key: "test.com_SINGLE" }, "{ status: 300 }");
	assert.deepEqual(lsFFSCacheManager.get({ key: "undefined_SINGLE" }), "{ status: 200 }");
	assert.deepEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), "{ status: 300 }");
	lsFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), "{ status: 300 }");
	assert.deepEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('LocalStorageFFSCacheManager test with encryptor and decryptor', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const lsFFSCacheManager = new LocalStorageFFSCacheManager(decryptor, encryptor, localStorage);
	lsFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: lsFFSCacheManager }, "{ status: 200 }"), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), [{
		FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
		key: "undefined_SINGLE",
		value: decryptor("{ status: 200 }")
	}]);
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), decryptor("{ status: 200 }"));
	lsFFSCacheManager.set({ key: "test.com_SINGLE" }, "{ status: 300 }");
	assert.deepEqual(lsFFSCacheManager.get({ key: "undefined_SINGLE" }), "{ status: 200 }");
	assert.deepEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), "{ status: 300 }");
	lsFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), "{ status: 300 }");
	assert.deepEqual(lsFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('SessionStorageFFSCacheManager test', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const ssFFSCacheManager = new SessionStorageFFSCacheManager(null, null, localStorage);
	ssFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: ssFFSCacheManager }, "{ status: 200 }"), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), [{
		FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
		key: "undefined_SINGLE",
		value: "{ status: 200 }"
	}]);
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), "{ status: 200 }");
	ssFFSCacheManager.set({ key: "test.com_SINGLE" }, "{ status: 300 }");
	assert.deepEqual(ssFFSCacheManager.get({ key: "undefined_SINGLE" }), "{ status: 200 }");
	assert.deepEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), "{ status: 300 }");
	ssFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), "{ status: 300 }");
	assert.deepEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('SessionStorageFFSCacheManager test with encryptor and decryptor', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const ssFFSCacheManager = new SessionStorageFFSCacheManager(decryptor, encryptor, localStorage);
	ssFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: ssFFSCacheManager }, "{ status: 200 }"), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), [{
		FROM_FFS_CACHE_MANAGER_INTERCEPTOR: true,
		key: "undefined_SINGLE",
		value: decryptor("{ status: 200 }")
	}]);
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), decryptor("{ status: 200 }"));
	ssFFSCacheManager.set({ key: "test.com_SINGLE" }, "{ status: 300 }");
	assert.deepEqual(ssFFSCacheManager.get({ key: "undefined_SINGLE" }), "{ status: 200 }");
	assert.deepEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), "{ status: 300 }");
	ssFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), "{ status: 300 }");
	assert.deepEqual(ssFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('CookieFFSCacheManager test', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const cookieFFSCacheManager = new CookieFFSCacheManager(null, null, null, localStorage);
	cookieFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: cookieFFSCacheManager }, { status: 200 }), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), []);
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), { status: 200 });
	cookieFFSCacheManager.set({ key: "test.com_SINGLE" }, { status: 300 });
	assert.deepEqual(cookieFFSCacheManager.get({ key: "undefined_SINGLE" }), { status: 200 });
	assert.deepEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	cookieFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), { status: 300 });
	assert.deepEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('CookieFFSCacheManager test with encryptor and decryptor', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const cookieFFSCacheManager = new CookieFFSCacheManager(decryptor, encryptor, null, localStorage);
	cookieFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), []);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: cookieFFSCacheManager }, "{ status: 200 }"), []);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), []);
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), decryptor("{ status: 200 }"));
	cookieFFSCacheManager.set({ key: "test.com_SINGLE" }, "{ status: 300 }");
	assert.deepEqual(cookieFFSCacheManager.get({ key: "undefined_SINGLE" }), "{ status: 200 }");
	assert.deepEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), "{ status: 300 }");
	cookieFFSCacheManager.remove({ key: "test.com_SINGLE" });
	assert.notEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), JSON.stringify({
		name: "test.com_SINGLE",
		expires: "",
		value: "{ status: 300 }",
		path: "/"
	}));
	assert.deepEqual(cookieFFSCacheManager.get({ key: "test.com_SINGLE" }), undefined);
});

it('KonfigerFFSCacheManager test', () => {
});

it('KeyvRedisFFSCacheManager test', () => {
});

