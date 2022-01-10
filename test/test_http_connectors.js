
const assert = require('assert');
const app = require("./resc/server");
const httpConnector = require("../lib/connectors/http/httpConnector");
const defaults = require('../lib/helpers/defaults');
let server;

before(done => {
	server = app.listen(3009, done);
});

after(done => {
	if (server) {
		server.close(done);
	}
});

it('httpConnector test get request', async () => {
	const hcResponse = await httpConnector({
		url: "http://127.0.0.1:3009/greet",
		method: "GET",
		timeout: 5000
	});

	assert.equal(hcResponse.status, 200);
	assert.equal(hcResponse.data, "Hello World!");
}).timeout(20000);

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
}).timeout(20000);

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
}).timeout(20000);

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
}).timeout(20000);

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
		}
	});

	console.log(hcResponse.status, hcResponse.data);
	assert.equal(hcResponse.status, 200);
});

/*it('post request auth', () => {
	const hc1 = httpConnector({
		url: "https://thecarisma.github.io",
		method: "GET",
		auth: {
			username: "test@mail.com",
			password: "password"
		}
	});

	console.log(hc1);
	//assert.equal(hc1);
});*/

