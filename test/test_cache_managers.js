
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
const MapFFSCacheManager = require('../lib/cache_managers/MapFFSCacheManager');
const CookieFFSCacheManager = require('../lib/cache_managers/CookieFFSCacheManager');
const LocalStorageFFSCacheManager = require('../lib/cache_managers/LocalStorageFFSCacheManager');
const SessionStorageFFSCacheManager = require('../lib/cache_managers/SessionStorageFFSCacheManager');

function decryptor(value, options) {
	return `{0123456890}_ENCRYPTED`;
}
function encryptor(value, options) {
	return `{0123456890}_ENCRYPTED`;
}

it('*FFSCacheManager TODO', () => {
	console.log("TEST REMOVAL OF INTERCEPTORS FROM FuInterceptor using *.interceptorIds");
});

it('MapFFSCacheManager test', () => {
	const map = { user: "thecarisma" };
	const fuInterceptor = new FuInterceptor();
	const mapFFSCacheManager = new MapFFSCacheManager(map);
	mapFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), undefined);
	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "POST_RESPONSE", { cache: mapFFSCacheManager, response: { status: 200 }}), undefined);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), undefined);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), { status: 200 });

	assert.deepEqual(map, { user: "thecarisma", undefined_SINGLE: { status: 200 } });
	assert.deepEqual(map.user, "thecarisma");
	assert.deepEqual(map.undefined_SINGLE, { status: 200 });
});

it('MapFFSCacheManager test Alt', () => {
	const fuInterceptor = new FuInterceptor();
	const mapFFSCacheManager = new MapFFSCacheManager();
	mapFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), undefined);
	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "POST_RESPONSE", { cache: mapFFSCacheManager, response: { status: 200 }}), undefined);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), undefined);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: mapFFSCacheManager }), { status: 200 });
});

it('LocalStorageFFSCacheManager test', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const lsFFSCacheManager = new LocalStorageFFSCacheManager(null, null, localStorage);
	lsFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), undefined);
	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: lsFFSCacheManager, response: "{ status: 200 }"}), undefined);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), undefined);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), "{ status: 200 }");
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), "{ status: 200 }");
});

it('LocalStorageFFSCacheManager test with encryptor and decryptor', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const lsFFSCacheManager = new LocalStorageFFSCacheManager(decryptor, encryptor, localStorage);
	lsFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), undefined);
	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: lsFFSCacheManager, response: "{ status: 200 }"}), undefined);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), undefined);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: lsFFSCacheManager }), decryptor("{ status: 200 }"));
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), decryptor("{ status: 200 }"));
});

it('SessionStorageFFSCacheManager test', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const ssFFSCacheManager = new SessionStorageFFSCacheManager(null, null, localStorage);
	ssFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), undefined);
	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: ssFFSCacheManager, response: "{ status: 200 }"}), undefined);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), undefined);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), "{ status: 200 }");
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), "{ status: 200 }");
});

it('SessionStorageFFSCacheManager test with encryptor and decryptor', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const ssFFSCacheManager = new SessionStorageFFSCacheManager(decryptor, encryptor, localStorage);
	ssFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), undefined);
	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: ssFFSCacheManager, response: "{ status: 200 }"}), undefined);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), undefined);
	assert.deepEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: ssFFSCacheManager }), decryptor("{ status: 200 }"));
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), decryptor("{ status: 200 }"));
});

it('CookieFFSCacheManager test', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const cookieFFSCacheManager = new CookieFFSCacheManager(null, null, null, localStorage);
	cookieFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), undefined);
	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: cookieFFSCacheManager, response: { status: 200 }}), undefined);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), undefined);
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), JSON.stringify({
		name: "undefined_SINGLE",
		expires: "",
		value: { status: 200 },
		path: "/"
	}));
});

it('CookieFFSCacheManager test with encryptor and decryptor', () => {
	const fuInterceptor = new FuInterceptor();
	localStorage.removeItem("undefined_SINGLE");
	const cookieFFSCacheManager = new CookieFFSCacheManager(decryptor, encryptor, null, localStorage);
	cookieFFSCacheManager.registerInterceptors(fuInterceptor);

	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), undefined);
	assert.equal(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_RESPONSE", { cache: cookieFFSCacheManager, response: "{ status: 200 }"}), undefined);
	assert.notEqual(utils.invokeForEachInterceptorType(fuInterceptor, "PRE_REQUEST", { cache: cookieFFSCacheManager }), undefined);
	assert.deepEqual(localStorage.getItem("undefined_SINGLE"), JSON.stringify({
		name: "undefined_SINGLE",
		expires: "",
		value: decryptor("{ status: 200 }", {}),
		path: "/"
	}));
});

it('RedisFFSCacheManager test', () => {
});

