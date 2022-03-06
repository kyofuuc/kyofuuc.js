
const assert = require('assert');
const ffs = require("../lib/kyofuuc");
const wsapp = require("./resc/wsserver");
const KyofuucWS = require('../lib/core/KyofuucWS');

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


function closeKfWSConnection(kfWs) {
	kfWs.close();
	openedWSConnections.pop();
}

it('KyofuucWS connect [text#sub-protocol]', () => {
	const kfWs = new KyofuucWS().ws({
		url: "ws://127.0.0.1:4000",
		protocol: [ "text" ]
	});

	assert.equal(kfWs.getUrl(), "ws://127.0.0.1:4000");
	kfWs.onOpen((kfws, event) => {
		assert.equal(kfWs.state, KyofuucWS.STATE.CONNECTED);
		assert.equal(kfWs.protocol, "text");
		kfWs.close();
	});
	kfWs.onClose((kfws, event) => {
		assert.equal(kfWs.state, KyofuucWS.STATE.DISCONNECTED);
	});
});

it('KyofuucWS connect [json#sub-protocol]', () => {
	const kfWs = ffs.ws({
		url: "ws://127.0.0.1:4000",
		protocol: [ "json" ]
	});

	kfWs.onOpen((kfws, event) => {
		assert.equal(kfWs.state, KyofuucWS.STATE.CONNECTED);
		assert.equal(kfWs.protocol, "json");
		kfWs.close();
	});
	kfWs.onClose((kfws, event) => {
		assert.equal(kfWs.state, KyofuucWS.STATE.DISCONNECTED);
	});
});

it('KyofuucWS test message sending [text#sub-protocol]', () => {
	const kfWs = ffs.ws({
		url: "ws://127.0.0.1:4000",
		protocol: [ "text" ]
	});

	kfWs.onOpen((kfws, event) => {
		assert.equal(kfWs.state, KyofuucWS.STATE.CONNECTED);
		kfWs.sendMessage("Hello World!");
		assert.equal(kfWs.getBufferedAmount(), 0);
		openedWSConnections.push(kfWs);
	});
	kfWs.onMessage((kfws, event, message) => {
		assert.equal(message, "RECEIVED: Hello World!");
		closeKfWSConnection(kfWs);
	});
});

it('KyofuucWS test message sending [json#sub-protocol]', () => {
	const kfWs = ffs.ws({
		url: "ws://127.0.0.1:4000",
		protocol: [ "json" ]
	});

	kfWs.onOpen((kfws, event) => {
		assert.equal(kfWs.state, 1);
		kfWs.sendMessage({
			message: "Hello World!"
		});
		assert.equal(kfWs.getBufferedAmount(), 0);
		openedWSConnections.push(kfWs);
	});
	kfWs.onMessage((kfws, event, message) => {
		assert.equal(message.received, true);
		assert.equal(message.data.type, "Buffer");
		assert.deepEqual(JSON.parse(new TextDecoder().decode(new Uint8Array(message.data.data))), {
			message: "Hello World!"
		});
		assert.deepEqual(JSON.parse(message.received_data), {
			message: "Hello World!"
		});
		closeKfWSConnection(kfWs);
	});
});

it('KyofuucWS Query String Authentication [text#sub-protocol]', () => {
	const kfWs1 = ffs.ws({
		url: "ws://127.0.0.1:4000",
		protocol: [ "text" ],
		params: {
			uid: "U1234",
			sid: "weytwge4578654gh5ghg"
		}
	});
	const kfWs2 = ffs.ws({
		url: "ws://127.0.0.1:4000",
		protocol: [ "text" ],
		params: {
			uid: "U1234",
			sid: "weytwge4578654gh5ghg___"
		}
	});

	assert.equal(kfWs1.getUrl(), "ws://127.0.0.1:4000?uid=U1234&sid=weytwge4578654gh5ghg");
	assert.equal(kfWs2.getUrl(), "ws://127.0.0.1:4000?uid=U1234&sid=weytwge4578654gh5ghg___");
	kfWs1.onOpen((kfws, event) => {
		assert.equal(kfWs1.state, KyofuucWS.STATE.CONNECTED);
		assert.equal(kfWs1.protocol, "text");
		kfWs1.close();
	});
	kfWs1.onClose((kfws, event) => {
		assert.equal(kfWs1.state, KyofuucWS.STATE.DISCONNECTED);
	});
	kfWs2.onClose((kfws, event) => {
		assert.equal(kfWs2.state, KyofuucWS.STATE.DISCONNECTED);
		assert.equal(kfWs2.getUrl(), "ws://127.0.0.1:4000?uid=U1234&sid=weytwge4578654gh5ghg___");
	});
});

it('KyofuucWS reconnect [text#sub-protocol]', () => {
	const kfWs1 = ffs.ws({
		url: "ws://127.0.0.1:4000",
		protocol: [ "text" ],
		reconnect: true,
		maxReconnect: 10,
	});
	let reconnectionCount = 0;

	kfWs1.onOpen((kfws, event) => {
		reconnectionCount++;
		assert.equal(kfWs1.state, KyofuucWS.STATE.CONNECTED);
		event.target.close();
	});
	kfWs1.onClose((kfws, event) => {
		assert.equal(kfWs1.reconnectionCount, 10);
		assert.equal(reconnectionCount-1, kfWs1.reconnectionCount);
		assert.equal(kfWs1.state, KyofuucWS.STATE.DISCONNECTED);
	});
});




