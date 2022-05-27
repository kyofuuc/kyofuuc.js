
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
const app = require("./resc/server");
const defaults = require('../lib/helpers/defaults');
const FuInterceptor = require('../lib/core/FuInterceptor');
const xhrConnector = require("../lib/connectors/http/xhrConnector");
const MapFFSCacheManager = require('../lib/cachemanagers/MapFFSCacheManager');
const CookieFFSCacheManager = require('../lib/cachemanagers/CookieFFSCacheManager');
const LocalStorageFFSCacheManager = require('../lib/cachemanagers/LocalStorageFFSCacheManager');
const SessionStorageFFSCacheManager = require('../lib/cachemanagers/SessionStorageFFSCacheManager');

let server;
let port = 3001;

before(done => {
	const startServer = (count, done) => {
		if (count >= 5) return;
		server = app.listen(port, done).on('error', (e) => {
			port++;
			startServer(++count, done);
		});
	}
	startServer(0, done);
});

after(done => {
	if (server) {
		server.close(done);
	}
});

it('xhrConnector server greet', async () => {
	const xcResponse = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET"
	});

	assert.equal(xcResponse.status, 200);
	assert.equal(xcResponse.data, "Hello World!");
});

it('xhrConnector test delete request', async () => {
	const xcResponse = await xhrConnector({
		url: `http://127.0.0.1:${port}/delete`,
		method: "DELETE"
	});

	assert.equal(xcResponse.status, 204);
});

it('xhrConnector test get request', async () => {
	const xcResponse = await xhrConnector({
		url: `http://127.0.0.1:${port}/get`,
		method: "GET"
	});

	assert.equal(xcResponse.status, 204);
});

it('xhrConnector test head request', async () => {
	const xcResponse = await xhrConnector({
		url: `http://127.0.0.1:${port}/head`,
		method: "HEAD"
	});

	assert.equal(xcResponse.status, 204);
});

it('xhrConnector test options request', async () => {
	const xcResponse = await xhrConnector({
		url: `http://127.0.0.1:${port}/options`,
		method: "OPTIONS"
	});

	assert.equal(xcResponse.status, 204);
});

it('xhrConnector test get request headers', async () => {
	const xcResponse = await xhrConnector({
		url: `http://127.0.0.1:${port}/headers`,
		method: "GET",
		timeout: 5000
	});

	assert.equal(xcResponse.headers.host, "127.0.0.1");
	assert.equal(xcResponse.headers['cache-control'], "max-age=0");
	assert.equal(xcResponse.headers.url, "/headers");
	assert.equal(xcResponse.status, 200);
});

// enable redirect in xhr
/*it('xhrConnector test redirect', async () => {
	const xcResponse1 = await xhrConnector({
		url: `http://127.0.0.1:${port}/redirect/301/301`,
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 0
	});
	const xcResponse2 = await xhrConnector({
		url: `http://127.0.0.1:${port}/redirect/302/302`,
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 1
	});
	const xcResponse3 = await xhrConnector({
		url: `http://127.0.0.1:${port}/redirect/200/200`,
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 2
	});

	assert.equal(xcResponse1.status, 301);
	assert.equal(xcResponse2.status, 302);
	assert.equal(xcResponse3.status, 200);
});

it('xhrConnector test redirect with redirectsData', async () => {
	const xcResponse = await xhrConnector({
		url: `http://127.0.0.1:${port}/redirect/301/302`,
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 2,
		storeRedirectsData: true
	});

	assert.equal(xcResponse.redirectsData[0].status, 301);
	assert.equal(xcResponse.redirectsData[1].status, 302);
	assert.equal(xcResponse.redirectsData.length, 2);
	assert.equal(xcResponse.status, 200);
});*/

it('xhrConnector test post request', async () => {
	const xcResponse = await xhrConnector({
		url: `http://127.0.0.1:${port}/post`,
		method: "POST",
		headers: {
			"User-Agent": "kyofuuc/0.01",
			'Content-Type': 'application/json'
		},
		data: {
			email: "test@mail.com",
			password: "pass"
		},
		responseType: "json"
	});

	assert.equal(xcResponse.status, 200);
	assert.equal(xcResponse.data.email, "test@mail.com");
	assert.equal(xcResponse.data.password, "pass");
});

it('xhrConnector test patch request', async () => {
	const xcResponse = await xhrConnector({
		url: `http://127.0.0.1:${port}/patch`,
		method: "PATCH",
		headers: {
			"User-Agent": "kyofuuc/0.01",
			'Content-Type': 'application/json'
		},
		data: {
			email: "test@mail.com",
			password: "pass"
		},
		responseType: "json"
	});
	
	assert.equal(xcResponse.status, 200);
	assert.equal(xcResponse.data.email, "test@mail.com");
	assert.equal(xcResponse.data.password, "pass");
});

it('xhrConnector test put request', async () => {
	const xcResponse = await xhrConnector({
		url: `http://127.0.0.1:${port}/put`,
		method: "PUT",
		headers: {
			"User-Agent": "kyofuuc/0.01",
			'Content-Type': 'application/json'
		},
		data: {
			email: "test@mail.com",
			password: "pass"
		},
		responseType: "json"
	});
	
	assert.equal(xcResponse.status, 200);
	assert.equal(xcResponse.data.email, "test@mail.com");
	assert.equal(xcResponse.data.password, "pass");
});

it('xhrConnector test request basic auth', async () => {
	const xcResponse1 = await xhrConnector({
		url: `http://127.0.0.1:${port}/profile`,
		method: "GET",
		responseType: "json"
	});
	const xcResponse2 = await xhrConnector({
		url: `http://127.0.0.1:${port}/profile`,
		method: "GET",
		auth: {
			username: "test.wrong@mail.com",
			password: "password"
		},
		responseType: "json"
	});
	const xcResponse3 = await xhrConnector({
		url: `http://127.0.0.1:${port}/profile`,
		method: "GET",
		auth: {
			username: "test@mail.com",
			password: "password"
		},
		responseType: "json"
	});

	assert.equal(xcResponse1.status, 400);
	assert.equal(xcResponse2.status, 401);
	assert.equal(xcResponse3.status, 200);
	assert.equal(xcResponse1.data.message, "Missing Authorization Header");
	assert.equal(xcResponse2.data.message, "Invalid Authentication Credentials");
	assert.equal(xcResponse3.data.message, "Success");
});

function decryptor(value, config) {
	return Buffer.from(value, 'base64').toString('ascii');
}

function encryptor(value, config) {
	return Buffer.from(value).toString('base64');
}

it('xhrConnector test with MapFFSCacheManager cache', async () => {
	const fuInterceptor = new FuInterceptor();
	const cacheManager = new MapFFSCacheManager();
	cacheManager.registerInterceptors(fuInterceptor);
	const xcResponse1 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager,
		refreshCache: true
	});
	const xcResponse2 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager
	});
	const xcResponse3 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "POST",
		cache: cacheManager,
		refreshCache: true
	});

	assert.equal(xcResponse1.status, 200);
	assert.equal(xcResponse1.isFromCache, false);
	assert.equal(xcResponse1.data, "Hello World!");
	assert.equal(xcResponse2.status, 200);
	assert.equal(xcResponse2.isFromCache, true);
	assert.equal(xcResponse2.data, "Hello World!");
	assert.equal(xcResponse3.isFromCache, false);
	assert.notEqual(xcResponse3.status, 200);
	assert.notEqual(xcResponse3.data, "Hello World!");
	assert.equal(xcResponse3.status, 404);
});

it('xhrConnector test with CookieFFSCacheManager cache', async () => {
	const fuInterceptor = new FuInterceptor();
	const cacheManager = new CookieFFSCacheManager({
		encryptor, decryptor, 
		bucket: localStorage
	});
	cacheManager.registerInterceptors(fuInterceptor);
	const xcResponse1 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager,
		refreshCache: true
	});
	const xcResponse2 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager
	});
	const xcResponse3 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "POST",
		cache: cacheManager,
		refreshCache: true
	});

	assert.equal(xcResponse1.status, 200);
	assert.equal(xcResponse1.isFromCache, false);
	assert.equal(xcResponse1.data, "Hello World!");
	assert.equal(xcResponse2.status, 200);
	assert.equal(xcResponse2.isFromCache, true);
	assert.equal(xcResponse2.data, "Hello World!");
	assert.equal(xcResponse3.isFromCache, false);
	assert.notEqual(xcResponse3.status, 200);
	assert.notEqual(xcResponse3.data, "Hello World!");
	assert.equal(xcResponse3.status, 404);
});

it('xhrConnector test with LocalStorageFFSCacheManager cache', async () => {
	const fuInterceptor = new FuInterceptor();
	const cacheManager = new LocalStorageFFSCacheManager({
		encryptor, decryptor, 
		bucket: localStorage
	});
	cacheManager.registerInterceptors(fuInterceptor);
	const xcResponse1 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager,
		refreshCache: true
	});
	const xcResponse2 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager
	});
	const xcResponse3 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "POST",
		cache: cacheManager,
		refreshCache: true
	});

	assert.equal(xcResponse1.status, 200);
	assert.equal(xcResponse1.isFromCache, false);
	assert.equal(xcResponse1.data, "Hello World!");
	assert.equal(xcResponse2.status, 200);
	assert.equal(xcResponse2.isFromCache, true);
	assert.equal(xcResponse2.data, "Hello World!");
	assert.equal(xcResponse3.isFromCache, false);
	assert.notEqual(xcResponse3.status, 200);
	assert.notEqual(xcResponse3.data, "Hello World!");
	assert.equal(xcResponse3.status, 404);
});

it('xhrConnector test with SessionStorageFFSCacheManager cache', async () => {
	const fuInterceptor = new FuInterceptor();
	const cacheManager = new SessionStorageFFSCacheManager({
		encryptor, decryptor, 
		bucket: localStorage
	});
	cacheManager.registerInterceptors(fuInterceptor);
	const xcResponse1 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager,
		refreshCache: true
	});
	const xcResponse2 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager
	});
	const xcResponse3 = await xhrConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "POST",
		cache: cacheManager,
		refreshCache: true
	});

	assert.equal(xcResponse1.status, 200);
	assert.equal(xcResponse1.isFromCache, false);
	assert.equal(xcResponse1.data, "Hello World!");
	assert.equal(xcResponse2.status, 200);
	assert.equal(xcResponse2.isFromCache, true);
	assert.equal(xcResponse2.data, "Hello World!");
	assert.equal(xcResponse3.isFromCache, false);
	assert.notEqual(xcResponse3.status, 200);
	assert.notEqual(xcResponse3.data, "Hello World!");
	assert.equal(xcResponse3.status, 404);
});

