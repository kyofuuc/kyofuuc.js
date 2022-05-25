
'use strict';

const utils = require('../utils');
const FuInterceptor = require('./FuInterceptor');
const KyofuucHttp = require('./KyofuucHttp');
const defaultRetryCache = utils.presentElseImport(typeof localStorage, 
	() => new (require('../cachemanagers/LocalStorageFFSCacheManager'))(null, null), 
	() => new (require('../cachemanagers/MapFFSCacheManager'))());

// This uses the stack data structure not queue, LIFO
function FuQueueManager(cache) {
    this._cache = cache || defaultRetryCache;
    this._interceptor = this._cache.interceptor || new FuInterceptor();
    this._entriesCount = this._cache.get({ key: "FUQUEUEMANAGER_ENTRIES_COUNT" }) || 0;
}

FuQueueManager.prototype.push = function push(object, type) {
    if (object === undefined) return;
    if (type && utils.isObject(object)) object.type = type;
    this._cache.set({
        key: `FUQUEUEMANAGER_ENTRY_${++this._entriesCount}`
    }, object);
    this._cache.set({ key: `FUQUEUEMANAGER_ENTRIES_COUNT` }, this._entriesCount);
    utils.forEach(utils.getGlobalEvent(utils.GLOBAL_EVENT_NAMES.EVENT_QUEUED), (cb) => cb(object.type, object));
}

FuQueueManager.prototype.pop = function pop() {
	if (this._entriesCount === 0) this._entriesCount = this._cache.get({ key: "FUQUEUEMANAGER_ENTRIES_COUNT" }) || 0;
    if (!this._entriesCount) return;
    const entryKey = `FUQUEUEMANAGER_ENTRY_${this._entriesCount}`;
    const data = this._cache.get({ key: entryKey });
    this._cache.remove({ key: entryKey });
    this._entriesCount--;
    if (!this._entriesCount) {
        this._cache.remove({ key: `FUQUEUEMANAGER_ENTRIES_COUNT` });
    } else {
        this._cache.set({ key: `FUQUEUEMANAGER_ENTRIES_COUNT` }, this._entriesCount);
    }
    return data;
}

// use global registered rebuilder function
// also use te defaults in ffs objects itself if resolvers not present
function rebuildRetryObject(config, ffs) {
    // if global resolver available, use instewad and return
    if (config._cacheName !== "") {
        config.cache = ffs.rebuildRetryObjectCache ? ffs.rebuildRetryObjectCache(config) : null;
        if (!config.cache) {
            switch (config._cacheName) {
                case "MapFFSCacheManager":
                    config.cache = new ffs.cachemanagers.MapFFSCacheManager();
                    break;
            }
        }
    }
    return config;
}

FuQueueManager.prototype.retry = function retry(type, ffs) {
    let entry;
    while ((entry = this.pop())) {
        if (entry.type !== type) continue;
        if (type === FuQueueManager.TYPE.HTTP_REQUEST) {
            (new ffs.KyofuucHttp()).request(rebuildRetryObject(entry.config, ffs))
            .then(response => {
                if (response.status != 109) {
                    utils.forEach(utils.getGlobalEvent(utils.GLOBAL_EVENT_NAMES.RETRY_SUCCESS), (cb) => cb(type, response));
                }
            }).catch(error => {
                utils.forEach(utils.getGlobalEvent(utils.GLOBAL_EVENT_NAMES.RETRY_FAILED), (cb) => cb(type, response));
            });
        }
    }
}

FuQueueManager.TYPE = {
    HTTP_REQUEST: "KYOFUUC_HTTP_REQUEST"
}

module.exports = FuQueueManager;
