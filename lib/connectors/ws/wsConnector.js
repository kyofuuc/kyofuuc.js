
'use strict';

const utils = require('../../utils');
const KFWebSocket = utils.presentElseImport(typeof WebSocket, 
	() => WebSocket,
	() => require("ws"));

function wsConnector(config, wsInterceptor) {
	const fullPath = utils.buildFullURLPath(config.baseURL, config.url);
	const absoluteUrl = utils.buildURL(fullPath, config.params, config.paramsSerializer);
	const socket = new KFWebSocket(absoluteUrl, config.protocol);

	socket.addEventListener('close', (e) => utils.invokeForEachInterceptorType(wsInterceptor, "WS_CLOSE", config, e));
	socket.addEventListener('error', (e) => utils.invokeForEachInterceptorType(wsInterceptor, "WS_ERROR", config, e));
	socket.addEventListener('message', (e) => utils.invokeForEachInterceptorType(wsInterceptor, "WS_MESSAGE", config, e));
	socket.addEventListener('open', (e) => utils.invokeForEachInterceptorType(wsInterceptor, "WS_OPEN", config, e));
	socket.implname = "wsConnector";

	return socket;
}

module.exports = wsConnector;
