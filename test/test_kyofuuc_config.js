
const assert = require('assert');
const Kyofuuc = require('../lib/core/Kyofuuc');
const MapFFSCacheManager = require('../lib/cache_managers/MapFFSCacheManager');

it('validate kyofuuc basic config', () => {
	const fu = new Kyofuuc();
	fu.get("/user/server/yahoo");
    assert.equal("", "");
})