
const assert = require('assert');
const Kyofuuc = require('../lib/core/Kyofuuc');
const MapFFSCacheManager = require('../lib/cachemanagers/MapFFSCacheManager');
const FuInterceptor = require('../lib/core/FuInterceptor');

it('validate kyofuuc base config', () => {
	const kf = new Kyofuuc();

    assert.deepEqual(kf.baseConfig, {});
    assert.deepEqual(kf.interceptor, new FuInterceptor());
    assert.equal(typeof kf.request === 'function', true);
    assert.equal(typeof kf.delete === 'function', true);
    assert.equal(typeof kf.get === 'function', true);
    assert.equal(typeof kf.head === 'function', true);
    assert.equal(typeof kf.options === 'function', true);
    assert.equal(typeof kf.post === 'function', true);
    assert.equal(typeof kf.put === 'function', true);
    assert.equal(typeof kf.patch === 'function', true);
});

it('validate kyofuuc interceptor', () => {
	const kf = new Kyofuuc();
	const i1 = kf.interceptor.registerPreRequest(undefined);
	const i2 = kf.interceptor.registerPostRequest(function (options, config) {});
	const i3 = kf.interceptor.registerPreResponse(function (options, config, response) {});
	const i4 = kf.interceptor.registerPostResponse(function (options, config, response) {});

    assert.notEqual(kf.interceptor.handlers[0], undefined);
    assert.equal(kf.interceptor.handlers[0].cb, undefined);
    assert.equal(kf.interceptor.handlers[0].type, "PRE_REQUEST");
    assert.equal(typeof kf.interceptor.handlers[1].cb, "function");
    assert.equal(typeof kf.interceptor.handlers[2].cb, "function");
    assert.equal(typeof kf.interceptor.handlers[3].cb, "function");
    assert.notEqual(kf.interceptor.handlers[1], undefined);
    assert.notEqual(kf.interceptor.handlers[3], undefined);

	kf.interceptor.unRegister(i2);
	kf.interceptor.unRegister(i4);
    assert.equal(kf.interceptor.handlers[1], undefined);
    assert.equal(kf.interceptor.handlers[3], undefined);
});

it('kyofuuc request', () => {
	function reqListener () {
		console.log(this.responseText);
	  }
	  
	  var oReq = new XMLHttpRequest();
	  oReq.addEventListener("load", reqListener);
	  oReq.open("GET", "http://www.example.org/example.txt");
	  oReq.send();
})

