
const assert = require('assert');
const app = require("./resc/server");
const ffs = require("../lib/kyofuuc");
const KyofuucHttp = require('../lib/core/KyofuucHttp');
const MapFFSCacheManager = require('../lib/cachemanagers/MapFFSCacheManager');
const FuInterceptor = require('../lib/core/FuInterceptor');

let server;
let port = 3001;

before(done => {
	const startServer = (count, done) => {
		if (count >= 5) return;
		server = app.listen(port, done).on('error', (e) => {
			port++;
			startServer(++count, done);
		});
	}
	startServer(0, done);
});

after(done => {
	if (server) {
		server.close(done);
	}
});

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
    assert.equal(kf.httpInterceptor.handlers[0].type, "HTTP_PRE_REQUEST");
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

it('kyofuuc request server greet', async () => {
	const ffsResponse = await (new KyofuucHttp()).request(`http://127.0.0.1:${port}/greet`, {
		method: "get",
		responseType: "text"
	});
	
	assert.equal(ffsResponse.status, 200);
	assert.equal(ffsResponse.data, "Hello World!");
});

it('kyofuuc request delete, get, head, options', async () => {
	const ffsResponseDelete = await (new KyofuucHttp()).request(`http://127.0.0.1:${port}/delete`, {
		method: "delete",
		responseType: "text"
	});
	const ffsResponseGet = await (new KyofuucHttp()).request(`http://127.0.0.1:${port}/get`, {
		method: "get",
		responseType: "text"
	});
	const ffsResponseHead = await ffs.request(`http://127.0.0.1:${port}/head`, {
		method: "head",
		responseType: "text"
	});
	const ffsResponseOptions = await ffs.request(`http://127.0.0.1:${port}/options`, {
		method: "options",
		responseType: "text"
	});
	
	assert.equal(ffsResponseDelete.status, 204);
	assert.equal(ffsResponseGet.status, 204);
	assert.equal(ffsResponseHead.status, 204);
	assert.equal(ffsResponseOptions.status, 204);
});

it('kyofuuc request post, patch, put', async () => {
	const ffsResponsePost = await ffs.request({
		url: `http://127.0.0.1:${port}/post`,
		method: "POST",
		headers: {
			"User-Agent": "kyofuuc/0.01",
			'Content-Type': 'application/json'
		},
		data: {
			email: "test@mail.com",
			password: "pass"
		},
		responseType: "json"
	});
	const ffsResponsePatch = await ffs.request({
		url: `http://127.0.0.1:${port}/patch`,
		method: "PATCH",
		headers: {
			"User-Agent": "kyofuuc/0.01",
			'Content-Type': 'application/json'
		},
		data: {
			email: "test@mail.com",
			password: "pass"
		},
		responseType: "json"
	});
	const ffsResponsePut = await ffs.request({
		url: `http://127.0.0.1:${port}/put`,
		method: "PUT",
		headers: {
			"User-Agent": "kyofuuc/0.01",
			'Content-Type': 'application/json'
		},
		data: {
			email: "test@mail.com",
			password: "pass"
		},
		responseType: "json"
	});

	assert.equal(ffsResponsePost.status, 200);
	assert.equal(ffsResponsePost.data.email, "test@mail.com");
	assert.equal(ffsResponsePost.data.password, "pass");
	assert.equal(ffsResponsePatch.status, 200);
	assert.equal(ffsResponsePatch.data.email, "test@mail.com");
	assert.equal(ffsResponsePatch.data.password, "pass");
	assert.equal(ffsResponsePut.status, 200);
	assert.equal(ffsResponsePut.data.email, "test@mail.com");
	assert.equal(ffsResponsePut.data.password, "pass");
});

it('kyofuuc request basic auth', async () => {
	const ffsResponse1 = await ffs.request({
		url: `http://127.0.0.1:${port}/profile`,
		method: "GET",
		responseType: "json",
		validateStatus: (status) => {
			return status >= 200 && status < 500;
		}
	});
	const ffsResponse2 = await ffs.request({
		url: `http://127.0.0.1:${port}/profile`,
		method: "GET",
		auth: {
			username: "test.wrong@mail.com",
			password: "password"
		},
		responseType: "json",
		validateStatus: (status) => {
			return status >= 200 && status < 500;
		}
	});
	const ffsResponse3 = await ffs.request({
		url: `http://127.0.0.1:${port}/profile`,
		method: "GET",
		auth: {
			username: "test@mail.com",
			password: "password"
		},
		responseType: "json"
	});

	assert.equal(ffsResponse1.status, 400);
	assert.equal(ffsResponse2.status, 401);
	assert.equal(ffsResponse3.status, 200);
	assert.equal(ffsResponse1.data.message, "Missing Authorization Header");
	assert.equal(ffsResponse2.data.message, "Invalid Authentication Credentials");
	assert.equal(ffsResponse3.data.message, "Success");
});

