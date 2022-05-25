
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
const httpConnector = require("../lib/connectors/http/httpConnector");
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

it('httpConnector server greet', async () => {
	const hcResponse = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET"
	});

	assert.equal(hcResponse.status, 200);
	assert.equal(hcResponse.data, "Hello World!");
});

it('httpConnector test delete request', async () => {
	const hcResponse = await httpConnector({
		url: `http://127.0.0.1:${port}/delete`,
		method: "DELETE"
	});

	assert.equal(hcResponse.status, 204);
});

it('httpConnector test get request', async () => {
	const hcResponse = await httpConnector({
		url: `http://127.0.0.1:${port}/get`,
		method: "GET"
	});

	assert.equal(hcResponse.status, 204);
});

it('httpConnector test head request', async () => {
	const hcResponse = await httpConnector({
		url: `http://127.0.0.1:${port}/head`,
		method: "HEAD"
	});

	assert.equal(hcResponse.status, 204);
});

it('httpConnector test options request', async () => {
	const hcResponse = await httpConnector({
		url: `http://127.0.0.1:${port}/options`,
		method: "OPTIONS"
	});

	assert.equal(hcResponse.status, 204);
});

it('httpConnector test get request headers', async () => {
	const hcResponse = await httpConnector({
		url: `http://127.0.0.1:${port}/headers`,
		method: "GET",
		timeout: 5000
	});

	assert.equal(hcResponse.headers.host, "127.0.0.1");
	assert.equal(hcResponse.headers['cache-control'], "max-age=0");
	assert.equal(hcResponse.headers.url, "/headers");
	assert.equal(hcResponse.status, 200);
});

it('httpConnector test redirect', async () => {
	const hcResponse1 = await httpConnector({
		url: `http://127.0.0.1:${port}/redirect/301/301`,
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 0
	});
	const hcResponse2 = await httpConnector({
		url: `http://127.0.0.1:${port}/redirect/302/302`,
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 1
	});
	const hcResponse3 = await httpConnector({
		url: `http://127.0.0.1:${port}/redirect/200/200`,
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 2
	});

	assert.equal(hcResponse1.status, 301);
	assert.equal(hcResponse2.status, 302);
	assert.equal(hcResponse3.status, 200);
});

it('httpConnector test redirect with redirectsData', async () => {
	const hcResponse = await httpConnector({
		url: `http://127.0.0.1:${port}/redirect/301/302`,
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 2,
		storeRedirectsData: true
	});

	assert.equal(hcResponse.redirectsData[0].status, 301);
	assert.equal(hcResponse.redirectsData[1].status, 302);
	assert.equal(hcResponse.redirectsData.length, 2);
	assert.equal(hcResponse.status, 200);
});

it('httpConnector test post request', async () => {
	const hcResponse = await httpConnector({
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

	assert.equal(hcResponse.status, 200);
	assert.equal(hcResponse.data.email, "test@mail.com");
	assert.equal(hcResponse.data.password, "pass");
});

it('httpConnector test patch request', async () => {
	const hcResponse = await httpConnector({
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
	
	assert.equal(hcResponse.status, 200);
	assert.equal(hcResponse.data.email, "test@mail.com");
	assert.equal(hcResponse.data.password, "pass");
});

it('httpConnector test put request', async () => {
	const hcResponse = await httpConnector({
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
	
	assert.equal(hcResponse.status, 200);
	assert.equal(hcResponse.data.email, "test@mail.com");
	assert.equal(hcResponse.data.password, "pass");
});

it('httpConnector test request basic auth', async () => {
	const hcResponse1 = await httpConnector({
		url: `http://127.0.0.1:${port}/profile`,
		method: "GET",
		responseType: "json"
	});
	const hcResponse2 = await httpConnector({
		url: `http://127.0.0.1:${port}/profile`,
		method: "GET",
		auth: {
			username: "test.wrong@mail.com",
			password: "password"
		},
		responseType: "json"
	});
	const hcResponse3 = await httpConnector({
		url: `http://127.0.0.1:${port}/profile`,
		method: "GET",
		auth: {
			username: "test@mail.com",
			password: "password"
		},
		responseType: "json"
	});

	assert.equal(hcResponse1.status, 400);
	assert.equal(hcResponse2.status, 401);
	assert.equal(hcResponse3.status, 200);
	assert.equal(hcResponse1.data.message, "Missing Authorization Header");
	assert.equal(hcResponse2.data.message, "Invalid Authentication Credentials");
	assert.equal(hcResponse3.data.message, "Success");
});

function decryptor(value, config) {
	return Buffer.from(value, 'base64').toString('ascii');
}

function encryptor(value, config) {
	return Buffer.from(value).toString('base64');
}

it('httpConnector test with MapFFSCacheManager cache', async () => {
	const fuInterceptor = new FuInterceptor();
	const cacheManager = new MapFFSCacheManager();
	cacheManager.registerInterceptors(fuInterceptor);
	const hcResponse1 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager,
		refreshCache: true
	});
	const hcResponse2 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager
	});
	const hcResponse3 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "POST",
		cache: cacheManager,
		refreshCache: true
	});

	assert.equal(hcResponse1.status, 200);
	assert.equal(hcResponse1.isFromCache, false);
	assert.equal(hcResponse1.data, "Hello World!");
	assert.equal(hcResponse2.status, 200);
	assert.equal(hcResponse2.isFromCache, true);
	assert.equal(hcResponse2.data, "Hello World!");
	assert.equal(hcResponse3.isFromCache, false);
	assert.notEqual(hcResponse3.status, 200);
	assert.notEqual(hcResponse3.data, "Hello World!");
	assert.equal(hcResponse3.status, 404);
});

it('httpConnector test with CookieFFSCacheManager cache', async () => {
	const fuInterceptor = new FuInterceptor();
	const cacheManager = new CookieFFSCacheManager({
		encryptor, decryptor, 
		bucket: localStorage
	});
	cacheManager.registerInterceptors(fuInterceptor);
	const hcResponse1 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager,
		refreshCache: true
	});
	const hcResponse2 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager
	});
	const hcResponse3 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "POST",
		cache: cacheManager,
		refreshCache: true
	});

	assert.equal(hcResponse1.status, 200);
	assert.equal(hcResponse1.isFromCache, false);
	assert.equal(hcResponse1.data, "Hello World!");
	assert.equal(hcResponse2.status, 200);
	assert.equal(hcResponse2.isFromCache, true);
	assert.equal(hcResponse2.data, "Hello World!");
	assert.equal(hcResponse3.isFromCache, false);
	assert.notEqual(hcResponse3.status, 200);
	assert.notEqual(hcResponse3.data, "Hello World!");
	assert.equal(hcResponse3.status, 404);
});

it('httpConnector test with LocalStorageFFSCacheManager cache', async () => {
	const fuInterceptor = new FuInterceptor();
	const cacheManager = new LocalStorageFFSCacheManager({
		encryptor, decryptor, 
		bucket: localStorage
	});
	cacheManager.registerInterceptors(fuInterceptor);
	const hcResponse1 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager,
		refreshCache: true
	});
	const hcResponse2 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager
	});
	const hcResponse3 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "POST",
		cache: cacheManager,
		refreshCache: true
	});

	assert.equal(hcResponse1.status, 200);
	assert.equal(hcResponse1.isFromCache, false);
	assert.equal(hcResponse1.data, "Hello World!");
	assert.equal(hcResponse2.status, 200);
	assert.equal(hcResponse2.isFromCache, true);
	assert.equal(hcResponse2.data, "Hello World!");
	assert.equal(hcResponse3.isFromCache, false);
	assert.notEqual(hcResponse3.status, 200);
	assert.notEqual(hcResponse3.data, "Hello World!");
	assert.equal(hcResponse3.status, 404);
});

it('httpConnector test with SessionStorageFFSCacheManager cache', async () => {
	const fuInterceptor = new FuInterceptor();
	const cacheManager = new SessionStorageFFSCacheManager({
		encryptor, decryptor, 
		bucket: localStorage
	});
	cacheManager.registerInterceptors(fuInterceptor);
	const hcResponse1 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager,
		refreshCache: true
	});
	const hcResponse2 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "GET",
		cache: cacheManager
	});
	const hcResponse3 = await httpConnector({
		url: `http://127.0.0.1:${port}/greet`,
		method: "POST",
		cache: cacheManager,
		refreshCache: true
	});

	assert.equal(hcResponse1.status, 200);
	assert.equal(hcResponse1.isFromCache, false);
	assert.equal(hcResponse1.data, "Hello World!");
	assert.equal(hcResponse2.status, 200);
	assert.equal(hcResponse2.isFromCache, true);
	assert.equal(hcResponse2.data, "Hello World!");
	assert.equal(hcResponse3.isFromCache, false);
	assert.notEqual(hcResponse3.status, 200);
	assert.notEqual(hcResponse3.data, "Hello World!");
	assert.equal(hcResponse3.status, 404);
});

