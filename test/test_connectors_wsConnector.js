
const assert = require('assert');
const wsapp = require("./resc/wsserver");
const defaults = require('../lib/helpers/defaults');
const FuInterceptor = require('../lib/core/FuInterceptor');
const wsConnector = require("../lib/connectors/ws/wsConnector");
const MapFFSCacheManager = require('../lib/cachemanagers/MapFFSCacheManager');
const CookieFFSCacheManager = require('../lib/cachemanagers/CookieFFSCacheManager');
const LocalStorageFFSCacheManager = require('../lib/cachemanagers/LocalStorageFFSCacheManager');
const SessionStorageFFSCacheManager = require('../lib/cachemanagers/SessionStorageFFSCacheManager');

let server;
let port = 4000;
const openedWSConnections = [];

before((done) => {
	const startServer = (count, done) => {
		if (count >= 5) return;
		server = (new wsapp()).listen(port, done).on('error', (e) => {
			port++;
			startServer(++count, done);
		});
	}
	startServer(0, done);
});

after(done => {
	let intervalId = setInterval(function() {
		if (openedWSConnections.length === 0) {
			server.close(done);
			clearInterval(intervalId);
		}
	}, 1000);
});

function closeWSConnection(wsConnection) {
	wsConnection.close();
	openedWSConnections.pop();
}

it('wsConnector connect [text#sub-protocol]', async () => {
	const wsConnection = wsConnector({
		url: `ws://127.0.0.1:${port}`,
		protocol: "text"
	});

	openedWSConnections.push(wsConnection);
	wsConnection.addEventListener('open', function open() {
		assert.equal(wsConnection.protocol, "text");
		assert.equal(wsConnection.readyState, 1);
		closeWSConnection(wsConnection);
	});
	wsConnection.addEventListener('close', function open(e) {
		assert.equal(wsConnection.readyState, 3);
	});
});

it('wsConnector connect [json#sub-protocol]', async () => {
	const wsConnection = wsConnector({
		url: `ws://127.0.0.1:${port}`,
		protocol: "json"
	});

	openedWSConnections.push(wsConnection);
	wsConnection.addEventListener('open', function open() {
		assert.equal(wsConnection.protocol, "json");
		assert.equal(wsConnection.readyState, 1);
		closeWSConnection(wsConnection);
	});
	wsConnection.addEventListener('close', function open(e) {
		assert.equal(wsConnection.readyState, 3);
	});
});

it('wsConnector test message sending [text#sub-protocol]', async () => {
	const wsConnection = wsConnector({
		url: `ws://127.0.0.1:${port}`,
		protocol: "text"
	});

	wsConnection.addEventListener('open', function open(e) {
		assert.equal(wsConnection.readyState, 1);
		wsConnection.send("Hello World!");
		assert.equal(wsConnection.bufferedAmount, 0);
		openedWSConnections.push(wsConnection);
	});
	wsConnection.addEventListener('message', function message(e) {
		assert.equal(e.data, "RECEIVED: Hello World!");
		closeWSConnection(wsConnection);
	});
});

it('wsConnector test message sending [json#sub-protocol]', async () => {
	const wsConnection = wsConnector({
		url: `ws://127.0.0.1:${port}`,
		protocol: "json"
	});

	wsConnection.addEventListener('open', function open(e) {
		assert.equal(wsConnection.readyState, 1);
		wsConnection.send(JSON.stringify({
			message: "Hello World!"
		}));
		assert.equal(wsConnection.bufferedAmount, 0);
		openedWSConnections.push(wsConnection);
	});
	wsConnection.addEventListener('message', function message(e) {
		const message = JSON.parse(e.data);
		assert.equal(message.received, true);
		assert.equal(message.data.type, "Buffer");
		assert.deepEqual(new TextDecoder().decode(new Uint8Array(message.data.data)), JSON.stringify({
			message: "Hello World!"
		}));
		assert.deepEqual(JSON.parse(message.received_data), {
			message: "Hello World!"
		});
		assert.deepEqual(new TextEncoder().encode(JSON.stringify({
			message: "Hello World!"
		})), new Uint8Array(message.data.data));
		closeWSConnection(wsConnection);
	});
});

it('wsConnector interceptor [text#sub-protocol]', async () => {
	const fuInterceptor = new FuInterceptor();
	const wsConnection = wsConnector({
		url: `ws://127.0.0.1:${port}`,
		protocol: "text"
	}, fuInterceptor);
	const wsConnection2 = wsConnector({
		url: `ws://127.0.0.1:12345`,
		protocol: "text"
	}, fuInterceptor);

	fuInterceptor.registerOnWSOpen((options, config, event) => {
		assert.equal(event.target, wsConnection);
		assert.equal(event.target.readyState, 1);
		openedWSConnections.push(wsConnection);
	}, {});
	fuInterceptor.registerOnWSOpen((options, config, event) => {
		assert.equal(event.target, wsConnection);
		assert.equal(event.target.readyState, 1);
		wsConnection.send("Hello World!");
		assert.equal(event.target.bufferedAmount, 0);
	}, {});
	fuInterceptor.registerOnWSMessage((options, config, event) => {
		assert.equal(event.target, wsConnection);
		assert.equal(event.data, "RECEIVED: Hello World!");
		closeWSConnection(event.target);
	}, {});
	fuInterceptor.registerOnWSClose((options, config, event) => {
		assert.equal(event.target.readyState, 3);
	}, {});

	fuInterceptor.registerOnWSError((options, config, event) => {
		assert.equal(event.target, wsConnection2);
		assert.equal(event.target.readyState, 2);
	}, {});
});

it('wsConnector Query String Authentication [text#sub-protocol]', async () => {
	const wsConnection = wsConnector({
		url: `ws://127.0.0.1:${port}`,
		protocol: "text",
		params: {
			uid: "U1234",
			sid: "weytwge4578654gh5ghg"
		}
	});
	const wsConnection2 = wsConnector({
		url: `ws://127.0.0.1:${port}`,
		protocol: "text",
		params: {
			uid: "U1234",
			sid: "weytwge4578654gh5ghg___"
		}
	});

	assert.equal(wsConnection.url, `ws://127.0.0.1:${port}?uid=U1234&sid=weytwge4578654gh5ghg`);
	assert.equal(wsConnection2.url, `ws://127.0.0.1:${port}?uid=U1234&sid=weytwge4578654gh5ghg___`);
	openedWSConnections.push(wsConnection);
	wsConnection.addEventListener('open', function open() {
		assert.equal(wsConnection.protocol, "text");
		assert.equal(wsConnection.readyState, 1);
		closeWSConnection(wsConnection);
	});
	wsConnection.addEventListener('close', function open(e) {
		assert.equal(wsConnection.readyState, 3);
	});
	wsConnection2.addEventListener('close', function open(e) {
		assert.equal(e.target.url, `ws://127.0.0.1:${port}?uid=U1234&sid=weytwge4578654gh5ghg___`);
	});
});

