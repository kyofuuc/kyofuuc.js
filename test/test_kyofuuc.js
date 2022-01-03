
const assert = require('assert');
const Kyofuuc = require('../lib/core/Kyofuuc');
const MapFFSCacheManager = require('../lib/cache_managers/MapFFSCacheManager');
const FuInterceptor = require('../lib/core/FuInterceptor');

it('validate kyofuuc base config', () => {
	const kf = new Kyofuuc();

    assert.deepEqual(kf.baseConfig, {});
    assert.deepEqual(kf.interceptor, new FuInterceptor());
    assert.equal(typeof kf.request === 'function', true);
    assert.equal(typeof kf.delete === 'function', true);
    assert.equal(typeof kf.get === 'function', true);
    assert.equal(typeof kf.head === 'function', true);
    assert.equal(typeof kf.options === 'function', true);
    assert.equal(typeof kf.post === 'function', true);
    assert.equal(typeof kf.put === 'function', true);
    assert.equal(typeof kf.patch === 'function', true);
});

