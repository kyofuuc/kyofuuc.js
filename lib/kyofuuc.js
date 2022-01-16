
const KyofuucHttp = require('./core/KyofuucHttp');
const KyofuucWS = require('./core/KyofuucWS');
const FuInterceptor = require('./core/FuInterceptor');
const defaults = require("./helpers/defaults");
const utils = require("./utils");

function ws(urlOrConfig, config) {
	if (typeof urlOrConfig === 'string') {
		config = config || {};
		config.url = urlOrConfig;
	} else {
		config = urlOrConfig || {};
	}
	let tempCache = config.cache;
	config = utils.mergeObject(config, this.httpBaseConfig);
	return (new KyofuucWS(config));
}

function initializeKyofuuc(config) {
	config = config || {};
	const kfHTTP = new KyofuucHttp((config.httpConfig || defaults.httpConfig));
	const kfWS = new KyofuucWS((config.wsConfig || defaults.wsConfig));
	const fu = new FuInterceptor();
	return utils.mergeClasses(fu, kfHTTP, kfWS);
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
