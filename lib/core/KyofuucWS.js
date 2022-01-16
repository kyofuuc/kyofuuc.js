
'use strict';

const utils = require('../utils');
const defaults = require('../helpers/defaults');

function KyofuucWS(wsBaseConfig) {
	this.wsBaseConfig = wsBaseConfig || {};
	this.eventHooks = {
		onOpen: [],
		onMessage: [],
		onClose: [],
		onError: [],
	};
}

utils.forEach(['onOpen', 'onMessage', 'onClose', 'onError'], function forEachWSEvent(event) {
	KyofuucWS.prototype[event] = function (hookFn) {
		this.eventHooks[event].push(hookFn);
	}
});

module.exports = KyofuucWS;
