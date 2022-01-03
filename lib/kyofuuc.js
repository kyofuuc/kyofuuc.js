
let Kyofuuc = require('./core/Kyofuuc');

function initializeKyofuuc(config) {
	return new Kyofuuc(config);
}

const ffs = initializeKyofuuc();

// add the Kyofuuc 
ffs.Kyofuuc = require('./core/Kyofuuc');

// add the FuInterceptor 
ffs.FuInterceptor = require('./core/FuInterceptor');

// add the utils 
ffs.utils = require("./utils");

// add the cache managers 
ffs.cache_managers = require("./cache_managers/index");

module.exports = ffs;
module.exports.default = ffs;
