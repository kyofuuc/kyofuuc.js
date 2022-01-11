
const assert = require('assert');
const app = require("./resc/server");
const defaults = require('../lib/helpers/defaults');
const FuInterceptor = require('../lib/core/FuInterceptor');
const httpConnector = require("../lib/connectors/http/httpConnector");
const MapFFSCacheManager = require('../lib/cachemanagers/MapFFSCacheManager');

let server;

before(done => {
	server = app.listen(3009, done);
});

after(done => {
	if (server) {
		server.close(done);
	}
});

it('httpConnector server greet', async () => {
	const hcResponse = await httpConnector({
		url: "http://127.0.0.1:3009/greet",
		method: "GET"
	});

	assert.equal(hcResponse.status, 200);
	assert.equal(hcResponse.data, "Hello World!");
});

it('httpConnector test delete request', async () => {
	const hcResponse = await httpConnector({
		url: "http://127.0.0.1:3009/delete",
		method: "DELETE"
	});

	assert.equal(hcResponse.status, 204);
});

it('httpConnector test get request', async () => {
	const hcResponse = await httpConnector({
		url: "http://127.0.0.1:3009/get",
		method: "GET"
	});

	assert.equal(hcResponse.status, 204);
});

it('httpConnector test head request', async () => {
	const hcResponse = await httpConnector({
		url: "http://127.0.0.1:3009/head",
		method: "HEAD"
	});

	assert.equal(hcResponse.status, 204);
});

it('httpConnector test options request', async () => {
	const hcResponse = await httpConnector({
		url: "http://127.0.0.1:3009/options",
		method: "OPTIONS"
	});

	assert.equal(hcResponse.status, 204);
});

it('httpConnector test get request headers', async () => {
	const hcResponse = await httpConnector({
		url: "http://127.0.0.1:3009/headers",
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
		url: "http://127.0.0.1:3009/redirect/301/301",
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 0
	});
	const hcResponse2 = await httpConnector({
		url: "http://127.0.0.1:3009/redirect/302/302",
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 1
	});
	const hcResponse3 = await httpConnector({
		url: "http://127.0.0.1:3009/redirect/200/200",
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
		url: "http://127.0.0.1:3009/redirect/301/302",
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
		url: "http://127.0.0.1:3009/post",
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
		url: "http://127.0.0.1:3009/patch",
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
		url: "http://127.0.0.1:3009/put",
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
		url: "http://127.0.0.1:3009/profile",
		method: "GET",
		responseType: "json"
	});
	const hcResponse2 = await httpConnector({
		url: "http://127.0.0.1:3009/profile",
		method: "GET",
		auth: {
			username: "test.wrong@mail.com",
			password: "password"
		},
		responseType: "json"
	});
	const hcResponse3 = await httpConnector({
		url: "http://127.0.0.1:3009/profile",
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
	//assert.equal(hc1);
});

it('httpConnector test with cache', async () => {
	const fuInterceptor = new FuInterceptor();
	const mapFFSCacheManager = new MapFFSCacheManager();
	mapFFSCacheManager.registerInterceptors(fuInterceptor);
	const hcResponse = await httpConnector({
		url: "http://127.0.0.1:3009/greet",
		method: "GET",
		cache: mapFFSCacheManager
	});

	console.log(mapFFSCacheManager.bucket);
	assert.equal(hcResponse.status, 200);
	assert.equal(hcResponse.data, "Hello World!");
});

