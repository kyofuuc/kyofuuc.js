
const assert = require('assert');
const httpConnector = require("../lib/connectors/http/httpconnector");
const defaults = require('../lib/helpers/defaults');

it('test get request', () => {
	const hc1 = httpConnector({
		url: "https://thecarisma.github.io",
		method: "GET",
		headers: {},
		...defaults.getHttpAgent()
	});

	console.log(hc1);
	//assert.equal(hc1);
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

