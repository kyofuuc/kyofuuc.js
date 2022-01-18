
const KyofuucHttp = require('./core/KyofuucHttp');
const KyofuucWS = require('./core/KyofuucWS');
const FuInterceptor = require('./core/FuInterceptor');
const defaults = require("./helpers/defaults");
const utils = require("./utils");

function initializeKyofuuc(config) {
	config = config || {};
	const kfHTTP = new KyofuucHttp((config.httpConfig || defaults.httpConfig));
	const kfWS = new KyofuucWS((config.wsConfig || defaults.wsConfig));
	kfHTTP.kfWS = kfWS;
	kfHTTP.ws = (p1, p2) => kfHTTP.kfWS.ws(p1, p2);
	return kfHTTP;
	//return utils.mergeClasses(kfHTTP, kfWS);
}

const ffs = initializeKyofuuc(defaults.httpConfig);

// add the core classes 
ffs.KyofuucWS = KyofuucWS;
ffs.KyofuucHttp = KyofuucHttp;
ffs.FuInterceptor = FuInterceptor;

// add defaults
ffs.defaults = defaults;

// add the utils 
ffs.utils = utils;

// add the cache managers 
ffs.cachemanagers = require("./cachemanagers/index");
ffs.connectors = require("./connectors/index");

module.exports = ffs;
module.exports.default = ffs;
