const assert = require('assert');
const FuInterceptor = require('../lib/core/FuInterceptor');

it('initialize FuInterceptor and validate register', () => {
	const fuInterceptor = new FuInterceptor();

    assert.equal(fuInterceptor.handlers.length, 0);
	assert.equal(fuInterceptor.register("PRE_REQUEST", function cb(options) {}, { synchronous: false}), 0);
	assert.equal(fuInterceptor.register("POST_REQUEST", function cb(options) {}, { when: function w(config) { return true; }}), 1);
    assert.equal(fuInterceptor.handlers.length, 2);

	assert.equal(fuInterceptor.handlers[0].type, "PRE_REQUEST");
	assert.equal(fuInterceptor.handlers[1].type, "POST_REQUEST");
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

	assert.equal(fuInterceptor.handlers[0].type, "PRE_REQUEST");
	assert.equal(fuInterceptor.handlers[1].type, "POST_REQUEST");
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

	assert.notEqual(fuInterceptor.handlers[0].type, "PRE_RESPONSE");
	assert.notEqual(fuInterceptor.handlers[1].type, "POST_RESPONSE");
	assert.equal(fuInterceptor.handlers[2].type, "PRE_RESPONSE");
	assert.equal(fuInterceptor.handlers[3].type, "POST_RESPONSE");
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
	assert.equal(fuInterceptor.register("PRE_REQUEST", function cb(options) {}, { synchronous: false}), 0);
	assert.equal(fuInterceptor.register("POST_REQUEST", function cb(options) {}, { when: function w(config) { return true; }}), 1);
    assert.equal(fuInterceptor.registerPreRequest(function cb(options) {}, { synchronous: false}), 2);
    assert.equal(fuInterceptor.registerPostRequest(function cb(options) {}, { when: function w(config) { return true; }}), 3);
    assert.equal(fuInterceptor.registerPreResponse(function cb(options) {}, { synchronous: false}), 4);
    assert.equal(fuInterceptor.registerPostResponse(function cb(options) {}, { when: function w(config) { return true; }}), 5);

	fuInterceptor.unRegister(1);
	fuInterceptor.unRegister(2);
	fuInterceptor.unRegister(5);
    assert.notEqual(fuInterceptor.handlers.length, 2);
    assert.equal(fuInterceptor.handlers.length, 6);

	assert.equal(fuInterceptor.handlers[0].type, "PRE_REQUEST");
	assert.equal(fuInterceptor.handlers[1], undefined);
	assert.equal(fuInterceptor.handlers[0].options.when, undefined);
	assert.equal(fuInterceptor.handlers[4].options.when, undefined);
	assert.notEqual(fuInterceptor.handlers[3].options.when({}), false);
	assert.equal(fuInterceptor.handlers[3].options.when({}), true);
});

it('FuInterceptor forEach', () => {
	const fuInterceptor = new FuInterceptor();
	
    assert.equal(fuInterceptor.handlers.length, 0);
	assert.equal(fuInterceptor.register("PRE_REQUEST", function cb(options) {}, { synchronous: false}), 0);
	assert.equal(fuInterceptor.register("POST_REQUEST", function cb(options) {}, { when: function w(config) { return true; }}), 1);
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
	
	fuInterceptor.forEach(function(handler) { assert.equal(handler.type, "PRE_REQUEST"); }, "PRE_REQUEST");
	fuInterceptor.forEach(function(handler) { assert.equal(handler.type, "POST_REQUEST"); }, "POST_REQUEST");
	fuInterceptor.forEach(function(handler) { assert.equal(handler.type, "PRE_RESPONSE"); }, "PRE_RESPONSE");
	fuInterceptor.forEach(function(handler) { assert.equal(handler.type, "POST_RESPONSE"); }, "POST_RESPONSE");
});

