const assert = require('assert');
const utils = require('../lib/utils');

it('utils.forEach', () => {
	utils.forEach(["get", "post", "patch", "delete"], function (method, key) {
		if (key == 0) assert.equal(method, "get");
		if (key == 1) assert.equal(method, "post");
		if (key == 2) assert.equal(method, "patch");
		if (key == 3) assert.equal(method, "delete");
	});
	utils.forEach([], function (method, key) {
		assert.equal(1, 2);
	});
});

it('utils.mergeObject', () => {
	const obj1 = {
		url: "test.com/user",
		method: "GET"
	};
	const obj2 = {
		baseUrl: "https://base.com",
		method: "POST"
	};
	const merged = utils.mergeObject(obj1, obj2);

	assert.equal(merged.url, obj1.url);
	assert.equal(merged.baseUrl, obj2.baseUrl);
	assert.notEqual(merged.method, obj2.method);
	assert.equal(merged.method, obj1.method);
});
