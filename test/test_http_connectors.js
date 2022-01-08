
const assert = require('assert');
const httpConnector = require("../lib/connectors/http/httpConnector");
const defaults = require('../lib/helpers/defaults');

it('test get request', async () => {
	const hcResponse = await httpConnector({
		url: "https://thecarisma.github.io",
		method: "GET",
		timeout: 5000
	});
	assert.equal(hcResponse.status, 200);
	assert.notEqual(hcResponse.data.indexOf("thecarisma"), -1)
});

it('test redirect', async () => {
	const hcResponse1 = await httpConnector({
		url: "http://google.com/search",
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 0
	});
	const hcResponse2 = await httpConnector({
		url: "http://google.com/search",
		method: "GET",
		params: {
			key: "value"
		},
		timeout: 5000,
		maxRedirects: 1
	});
	const hcResponse3 = await httpConnector({
		url: "http://google.com/search",
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

/*it('post post request', () => {
	const hc1 = httpConnector({
		url: "https://thecarisma.github.io",
		method: "POST",
		headers: {
			"User-Agent": "kyofuuc/0.01"
		},
		data: {
			email: "test@mail.com",
			password: "pass"
		}
	});

	console.log(hc1);
	//assert.equal(hc1);
});

it('post request auth', () => {
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

