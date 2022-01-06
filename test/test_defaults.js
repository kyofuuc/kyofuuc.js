
const assert = require('assert');
const utils = require("../lib/utils");
const defaults = require('../lib/helpers/defaults');

it('defaults.getDefaultHttpConnector', () => {
	assert.equal(typeof defaults.getDefaultHttpConnector, "function");
	assert.equal(defaults.getDefaultHttpConnector().name, utils.envIsBrowser()
		? "XMLHttpRequestConnector"
		: "httpConnector");
});

it('defaults.httpConfig', () => {
	assert.deepEqual(defaults.httpConfig.connector, defaults.getDefaultHttpConnector());
	assert.deepEqual(defaults.httpConfig.timeout, 0);
	assert.deepEqual(defaults.httpConfig.xsrfCookieName, 'XSRF-TOKEN');
	assert.deepEqual(defaults.httpConfig.xsrfHeaderName, 'X-XSRF-TOKEN');
	assert.deepEqual(defaults.httpConfig.maxContentLength, -1);
	assert.deepEqual(defaults.httpConfig.maxBodyLength, -1);
	assert.deepEqual(defaults.httpConfig.headers, {
		common: {
			'Accept': 'application/json, text/plain, */*'
		}
	});
});
