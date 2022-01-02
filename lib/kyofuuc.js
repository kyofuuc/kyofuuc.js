
let Kyofuuc = require('./core/Kyofuuc');
let FuInterceptor = require('./core/FuInterceptor');


function initializeKyofuuc(config) {
	return new Kyofuuc(config);
}

const ffs = initializeKyofuuc();

module.exports = ffs;
module.exports.default = ffs;
