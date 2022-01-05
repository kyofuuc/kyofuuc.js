
const assert = require('assert');
const httpConnector = require("../lib/connectors/http/httpconnector");

it('test get request', () => {
	const hc1 = httpConnector({
		url: "https://thecarisma.github.io",
		method: "GET",
		headers: {}
	});

	console.log(hc1);
	//assert.equal(hc1);
});

it('post post request', () => {
	const hc1 = httpConnector({
		url: "https://thecarisma.github.io",
		method: "GET",
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

