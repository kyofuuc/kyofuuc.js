
const WebSocket = require('ws');

function onMessage(ws, message) {
	if (ws.protocol === "json") {
		ws.send(JSON.stringify({
			received: true,
			received_data: `${message}`,
			data: message
		}));
	} else {
		ws.send(`RECEIVED: ${message}`);
	}
}

function onConnect(ws) {
	ws.on('message', (message) => onMessage(ws, message));
}

function WSServer() {
	this.port = 4000;
	this.wss = undefined;
	this.eventListeners = [];
};

WSServer.prototype.on = function on(event, callback) {
	this.eventListeners.push({
		event,
		callback
	});
	return this;
};

WSServer.prototype.sendEvent = function sendEvent(event, arg) {
	for (let eventListener of this.eventListeners) {
		if (eventListener.event === event) {
			eventListener.callback(arg);
		}
	}
	return this;
};

WSServer.prototype.listen = function listen(port, callback) {
	this.port = port;
	this.eventListeners = [];
	this.wss = new WebSocket.Server({ port: port }, callback).on("error", (err) => {
		this.sendEvent("error", err);
	});
	this.wss.on('connection', onConnect);
	return this;
};

WSServer.prototype.close = function close(callback) {
	if (this.wss) this.wss.close(callback);
	return this;
};

module.exports = (new WSServer());
