
const assert = require('assert');
const FuInterceptor = require('../lib/core/FuInterceptor');

it('initialize FuInterceptor and validate register', () => {
	const fuInterceptor = new FuInterceptor();

    assert.equal(fuInterceptor.handlers.length, 0);
	assert.equal(fuInterceptor.register("HTTP_PRE_REQUEST", function cb(options) {}, { synchronous: false}), 0);
	assert.equal(fuInterceptor.register("HTTP_POST_REQUEST", function cb(options) {}, { when: function w(config) { return true; }}), 1);
    assert.equal(fuInterceptor.handlers.length, 2);

	assert.equal(fuInterceptor.handlers[0].type, "HTTP_PRE_REQUEST");
	assert.equal(fuInterceptor.handlers[1].type, "HTTP_POST_REQUEST");
	assert.equal(fuInterceptor.handlers[0].options.when, undefined);
	assert.notEqual(fuInterceptor.handlers[1].options.when, undefined);
	assert.notEqual(fuInterceptor.handlers[1].options.when({}), false);
	assert.equal(fuInterceptor.handlers[1].options.when({}), true);

	fuInterceptor.unRegister(1);
    assert.notEqual(fuInterceptor.handlers.length, 1);
    assert.equal(fuInterceptor.handlers.length, 2);
});

it('typed FuInterceptor register*Request', () => {
	const fuInterceptor = new FuInterceptor();
	
    assert.equal(fuInterceptor.handlers.length, 0);
    assert.equal(fuInterceptor.registerPreRequest(function cb(options) {}, { synchronous: false}), 0);
    assert.equal(fuInterceptor.registerPostRequest(function cb(options) {}, { when: function w(config) { return true; }}), 1);

	assert.equal(fuInterceptor.handlers[0].type, "HTTP_PRE_REQUEST");
	assert.equal(fuInterceptor.handlers[1].type, "HTTP_POST_REQUEST");
	assert.equal(fuInterceptor.handlers[0].options.when, undefined);
	assert.notEqual(fuInterceptor.handlers[1].options.when, undefined);
	assert.notEqual(fuInterceptor.handlers[1].options.when({}), false);
	assert.equal(fuInterceptor.handlers[1].options.when({}), true);

	fuInterceptor.unRegister(1);
    assert.notEqual(fuInterceptor.handlers.length, 1);
    assert.equal(fuInterceptor.handlers.length, 2);
});

it('typed FuInterceptor register*Response', () => {
	const fuInterceptor = new FuInterceptor();
	
    assert.equal(fuInterceptor.handlers.length, 0);
    assert.equal(fuInterceptor.registerPreRequest(function cb(options) {}, { synchronous: false}), 0);
    assert.equal(fuInterceptor.registerPostRequest(function cb(options) {}, { when: function w(config) { return true; }}), 1);
    assert.equal(fuInterceptor.registerPreResponse(function cb(options) {}, { synchronous: false}), 2);
    assert.equal(fuInterceptor.registerPostResponse(function cb(options) {}, { when: function w(config) { return true; }}), 3);

	assert.notEqual(fuInterceptor.handlers[0].type, "HTTP_PRE_RESPONSE");
	assert.notEqual(fuInterceptor.handlers[1].type, "HTTP_POST_RESPONSE");
	assert.equal(fuInterceptor.handlers[2].type, "HTTP_PRE_RESPONSE");
	assert.equal(fuInterceptor.handlers[3].type, "HTTP_POST_RESPONSE");
	assert.equal(fuInterceptor.handlers[0].options.when, undefined);
	assert.notEqual(fuInterceptor.handlers[1].options.when, undefined);
	assert.notEqual(fuInterceptor.handlers[1].options.when({}), false);
	assert.equal(fuInterceptor.handlers[1].options.when({}), true);

	fuInterceptor.unRegister(1);
    assert.notEqual(fuInterceptor.handlers.length, 2);
    assert.equal(fuInterceptor.handlers.length, 4);
});

it('FuInterceptor unRegister', () => {
	const fuInterceptor = new FuInterceptor();
	
    assert.equal(fuInterceptor.handlers.length, 0);
	assert.equal(fuInterceptor.register("HTTP_PRE_REQUEST", function cb(options) {}, { synchronous: false}), 0);
	assert.equal(fuInterceptor.register("HTTP_POST_REQUEST", function cb(options) {}, { when: function w(config) { return true; }}), 1);
    assert.equal(fuInterceptor.registerPreRequest(function cb(options) {}, { synchronous: false}), 2);
    assert.equal(fuInterceptor.registerPostRequest(function cb(options) {}, { when: function w(config) { return true; }}), 3);
    assert.equal(fuInterceptor.registerPreResponse(function cb(options) {}, { synchronous: false}), 4);
    assert.equal(fuInterceptor.registerPostResponse(function cb(options) {}, { when: function w(config) { return true; }}), 5);

	fuInterceptor.unRegister(1);
	fuInterceptor.unRegister(2);
	fuInterceptor.unRegister(5);
    assert.notEqual(fuInterceptor.handlers.length, 2);
    assert.equal(fuInterceptor.handlers.length, 6);

	assert.equal(fuInterceptor.handlers[0].type, "HTTP_PRE_REQUEST");
	assert.equal(fuInterceptor.handlers[1], undefined);
	assert.equal(fuInterceptor.handlers[0].options.when, undefined);
	assert.equal(fuInterceptor.handlers[4].options.when, undefined);
	assert.notEqual(fuInterceptor.handlers[3].options.when({}), false);
	assert.equal(fuInterceptor.handlers[3].options.when({}), true);
});

it('FuInterceptor forEach', () => {
	const fuInterceptor = new FuInterceptor();
	
    assert.equal(fuInterceptor.handlers.length, 0);
	assert.equal(fuInterceptor.register("HTTP_PRE_REQUEST", function cb(options) {}, { synchronous: false}), 0);
	assert.equal(fuInterceptor.register("HTTP_POST_REQUEST", function cb(options) {}, { when: function w(config) { return true; }}), 1);
    assert.equal(fuInterceptor.registerPreRequest(function cb(options) {}, { synchronous: false}), 2);
    assert.equal(fuInterceptor.registerPostRequest(function cb(options) {}, { when: function w(config) { return true; }}), 3);
    assert.equal(fuInterceptor.registerPreResponse(function cb(options) {}, { synchronous: false}), 4);
    assert.equal(fuInterceptor.registerPostResponse(function cb(options) {}, { when: function w(config) { return true; }}), 5);

	fuInterceptor.forEach(function(handler) {
		if (handler.when) {
			assert.equal(handler.when(), true);
		} else {
			assert.equal(handler.when, undefined);
		}
	});
	
	fuInterceptor.forEach(function(handler) { assert.equal(handler.type, "HTTP_PRE_REQUEST"); }, "HTTP_PRE_REQUEST");
	fuInterceptor.forEach(function(handler) { assert.equal(handler.type, "HTTP_POST_REQUEST"); }, "HTTP_POST_REQUEST");
	fuInterceptor.forEach(function(handler) { assert.equal(handler.type, "HTTP_PRE_RESPONSE"); }, "HTTP_PRE_RESPONSE");
	fuInterceptor.forEach(function(handler) { assert.equal(handler.type, "HTTP_POST_RESPONSE"); }, "HTTP_POST_RESPONSE");
});


// TODO: Add test for WS_* interceptors
