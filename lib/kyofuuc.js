
let KyofuucHttp = require('./core/KyofuucHttp');
let FuInterceptor = require('./core/FuInterceptor');
const defaults = require("./helpers/defaults");
const utils = require("./utils");

function initializeKyofuuc(httpConfig, xmppConfig) {
	const kfHTTP = new KyofuucHttp((httpConfig || defaults.httpConfig));
	const fu = new FuInterceptor();
	//const kfXMPP = new KyofuucXMPP((xmppConfig || defaults.xmppConfig));
	// merge the other protocols too
	return utils.mergeClasses(fu, kfHTTP);
}

const ffs = initializeKyofuuc(defaults.httpConfig);

// add the KyofuucHttp 
ffs.KyofuucHttp = require('./core/KyofuucHttp');

// add the FuInterceptor 
ffs.FuInterceptor = require('./core/FuInterceptor');

// add defaults
ffs.defaults = defaults;

// add the utils 
ffs.utils = utils;

// add the cache managers 
ffs.cachemanagers = require("./cachemanagers/index");
ffs.connectors = require("./connectors/index");

module.exports = ffs;
module.exports.default = ffs;
