
const KyofuucHttp = require('./core/KyofuucHttp');
const KyofuucWS = require('./core/KyofuucWS');
const FuInterceptor = require('./core/FuInterceptor');
const FuQueueManager = require('./core/FuQueueManager');
const connectors = require('./connectors/index');
const cachemanagers = require('./cachemanagers/index');
const defaults = require("./helpers/defaults");
const utils = require("./utils");

function init(config) {
	const queueManager = (config || {}).fuQueueManager || new FuQueueManager();
	if (config && config.httpConfig && !config.httpConfig.fuQueueManager) config.httpConfig.fuQueueManager = queueManager;
	const kfHTTP = new KyofuucHttp(((config.httpConfig || config) || defaults.httpConfig));
	const kfWS = new KyofuucWS(((config.wsConfig || config) || defaults.wsConfig));
	kfHTTP.kfWS = kfWS;
	kfHTTP.queueManager = queueManager;
	kfHTTP.ws = (p1, p2) => kfHTTP.kfWS.ws(p1, p2);
	return kfHTTP;
	//return utils.mergeClasses(kfHTTP, kfWS);
}

function retryHttpRequests(queueManager, ffs) {
	if (!queueManager) return;
	queueManager.retry("KYOFUUC_HTTP_REQUEST", ffs);
}

const ffs = init(defaults.httpConfig);

// add the core classes 
ffs.KyofuucWS = KyofuucWS;
ffs.KyofuucHttp = KyofuucHttp;
ffs.FuInterceptor = FuInterceptor;

// add defaults
ffs.defaults = defaults;

// add the utils 
ffs.utils = utils;
ffs.init = init;
ffs.retryHttpRequests = retryHttpRequests;
ffs.retryRequests = () => {
	retryHttpRequests(ffs.queueManager, ffs);
};

// add the cache managers 
ffs.cachemanagers = cachemanagers;
ffs.connectors = connectors;

module.exports = ffs;
module.exports.default = ffs;
