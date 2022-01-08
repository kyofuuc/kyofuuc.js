
const assert = require('assert');
const KyofuucHttp = require('../lib/core/KyofuucHttp');
const MapFFSCacheManager = require('../lib/cachemanagers/MapFFSCacheManager');
const FuInterceptor = require('../lib/core/FuInterceptor');
const ffs = require("../lib/kyofuuc")

it('validate kyofuuc base config', () => {
	const kf = new KyofuucHttp();

    assert.deepEqual(kf.httpBaseConfig, {});
    assert.deepEqual(kf.httpInterceptor, new FuInterceptor());
    assert.equal(typeof kf.request === 'function', true);
    assert.equal(typeof kf.delete === 'function', true);
    assert.equal(typeof kf.get === 'function', true);
    assert.equal(typeof kf.head === 'function', true);
    assert.equal(typeof kf.options === 'function', true);
    assert.equal(typeof kf.post === 'function', true);
    assert.equal(typeof kf.put === 'function', true);
    assert.equal(typeof kf.patch === 'function', true);
});

it('validate kyofuuc httpInterceptor', () => {
	const kf = new KyofuucHttp();
	const i1 = kf.httpInterceptor.registerPreRequest(undefined);
	const i2 = kf.httpInterceptor.registerPostRequest(function (options, config) {});
	const i3 = kf.httpInterceptor.registerPreResponse(function (options, config, response) {});
	const i4 = kf.httpInterceptor.registerPostResponse(function (options, config, response) {});

    assert.notEqual(kf.httpInterceptor.handlers[0], undefined);
    assert.equal(kf.httpInterceptor.handlers[0].cb, undefined);
    assert.equal(kf.httpInterceptor.handlers[0].type, "PRE_REQUEST");
    assert.equal(typeof kf.httpInterceptor.handlers[1].cb, "function");
    assert.equal(typeof kf.httpInterceptor.handlers[2].cb, "function");
    assert.equal(typeof kf.httpInterceptor.handlers[3].cb, "function");
    assert.notEqual(kf.httpInterceptor.handlers[1], undefined);
    assert.notEqual(kf.httpInterceptor.handlers[3], undefined);

	kf.httpInterceptor.unRegister(i2);
	kf.httpInterceptor.unRegister(i4);
    assert.equal(kf.httpInterceptor.handlers[1], undefined);
    assert.equal(kf.httpInterceptor.handlers[3], undefined);
});

it('kyofuuc request', () => {
	function reqListener () {
		console.log(this.responseText);
	}
	ffs.get("https://google.com/search", { maxRedirects: -1, timeout: 2000, params: { one: "one"} }).then(function (response) {
		console.log("RESPONSE", response.status)
	}).catch(function (err) {
		console.error(err.message)
	});
	  
	  /*var oReq = new XMLHttpRequest();
	  oReq.addEventListener("load", reqListener);
	  oReq.open("GET", "http://www.example.org/example.txt");
	  oReq.send();*/
})

