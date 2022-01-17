
const assert = require('assert');
//const wsapp = require("./resc/wsserver");
const KyofuucWS = require('../lib/core/KyofuucWS');
const ffs = require("../lib/kyofuuc");

/*let server;
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
});*/

it('quick text', () => {
	const kfWs = new KyofuucWS({ url: "ws://127.0.0.1:4000" });
	kfWs.onOpen((event) => {

	});

	//console.log(kfWs);
});

