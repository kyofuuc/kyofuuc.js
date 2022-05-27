
# kyofuuc.js

Simple yet powerful HTTP, Web Socket client with cache and offline support for JavaScript. For both browser and node.js.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Todo](#todo)
- [Examples](#examples)
    - [HTTP](#http)
    - [Web Socket](#web-socket)
- [Interceptors](#interceptors)
- [Cache](#cache)
    - [Cache Managers](#cache-managers)
    - [Cache Examples](#cache-examples)
    - [Cache API](#cache-api)
- [Request Retry](#request-retry)
    - [Retry Callbacks](#retry-callbacks)
- [Kyofuuc API](#kyofuuc-api)
    - [Request Config](#request-config)
    - [Response Schema](#response-schema)
- [Why](#why)
- [How it works](#how-it-works)
- [Contributing](#contributing)
- [References](#references)
- [License](#license)

## Features

- Supports Promise API
- Supports all HTTP request methods. DELETE, GET, HEAD, OPTIONS, POST, PUT, PATCH
- Intuitive Web Socket APIs
- Intercept for pre, post HTTP request and response
- Supports response cache with various [cache managers](#cache-managers)
- Request cache and retry when in offline mode
- Intuitive and extensible cache API
- Automatic JSON data transform for request

## Installation

Using npm:

```
npm install kyofuuc
```

Using bower:

```bash
bower install kyofuuc
```

Using yarn:

```bash
yarn add kyofuuc
```

Using jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/kyofuuc/dist/kyofuuc.min.js"></script>
```

Using unpkg CDN:

```html
<script src="https://unpkg.com/kyofuuc/dist/kyofuuc.min.js"></script>
```

## Todo

- [x] http request
- [x] web socket API
- [ ] TCP and UDP support
- [x] interceptor
- [x] cache support
- [x] retry support
- [ ] retry support with timer

## Examples

### HTTP

Performing a `GET` request

```js
const ffs = require("kyofuuc");

// Get user from a page
ffs.get("/article?page=1").then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});

// The request above can be re-written as
ffs.get("/article", { 
    params: {
        page: 1
    }
}).then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});

// With the async/await API
async function getArticles() {
    try {
        const response = await ffs.get('/article?page=1');
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}
```

Performing a `POST` request 

```js
const ffs = require("kyofuuc");

ffs.post("/article", {
    title: "Character Guide",
    author: "Unknown"
}).then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});
```

### Web Socket

```js
const ffs = require("kyofuuc");

const socket = ffs.ws({
    url: "ws://127.0.0.1:4000",
    protocol: [ "json" ]
});
socket.onOpen((ws, event) => {
    console.log("Socket opened");
});
socket.onClose((ws, event) => {
    console.log("Socket closed");
});
socket.onError((ws, event) => {
    console.error("Socket error");
});
socket.onMessage((ws, event, message) => {
    console.log("Socket received message:", message);
});
socket.onStateChange((ws, state) => {
    console.error("Socket state changed to:", state)
});
```

## Interceptors

You can intercept request or response before and after they are handled by `then` or 
`catch`.

```js
const ffs = require("kyofuuc");

ffs.interceptors.preRequest((config) => {

});
ffs.interceptors.postResponse((config, response) => {

});

ffs.get("/article?page=1").then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});
```

## Cache

kyofuuc support HTTP response cache. kyofuuc provides intuitive API and methods to cache request response.
There are various builtin cache managers that defines are the response data is stored 
and retrieved, a custom cache manager can also be implemented by following the cache API definitions.

A request can be configured to use the cache by setting the following values in the request config

```yaml
cache: CacheManager
refreshCache: boolean
key: string?
```

The `cache` field specifies the cache manager to use for the data storage.

If `refreshCache` is set to true, the cache response will be ignored and will be updated with the new response from request.

The cache `key` is optional, if it not set kyofuuc concatenate the request url, method and *_SINGLE* or *_RESOURCE* to 
generate a unique key for that request.

Sample cached request config

```js
let config = {
    cache: new MapFFSCacheManager(),
    forceRefresh: true,
    key: "USER_PROFILE"
}
```

### Cache Managers

#### MapFFSCacheManager

This cache manager store data in JSON, the data is not persistence across pages after refresh or revisiting the section 
the cached data will be gone. Optionally a persistence JSON object can be passed to the contructor.

Signature

```js
const options = {
    bucket
} | {};
function MapFFSCacheManager(options?);
```

Initialization Samples

```js
const ffs = require("kyofuuc");
const cacheManagers = ffs.cachemanagers;

const cacheManager1 = new cacheManagers.MapFFSCacheManager();
const cacheManager2 = new cacheManagers.MapFFSCacheManager({});
const cacheManager3 = new cacheManagers.MapFFSCacheManager({
    bucket: {}
});
```

#### CookieFFSCacheManager

This cache managers stores data in the browser cookie, the data is persistence on the browser which make the data accessible to other 
domains and website apart from the origin. CookieFFSCacheManager accepts encryptor, decryptor and expiryInMilliSeconds in the constructor options.
The default expiry time of the cookie is 24 hours.

Signature

```js
const options = {
    bucket?
    encryptor?
    decryptor?
    expiryInMilliSeconds?
} | document.cookie;
function CookieFFSCacheManager(options?: object);
```

Initialization Samples

```js
const ffs = require("kyofuuc");
const cacheManagers = ffs.cachemanagers;

const cacheManager1 = new cacheManagers.CookieFFSCacheManager();
const cacheManager2 = new cacheManagers.CookieFFSCacheManager(document.cookie);
const cacheManager3 = new cacheManagers.CookieFFSCacheManager({
    bucket: document.cookie,
    expiryInMilliSeconds: ((10) *24*60*60*1000),
    encryptor: (value, config) => Buffer.from(value).toString('base64'),
    decryptor: (value, config) => Buffer.from(value, 'base64').toString('ascii')
});
```

#### LocalStorageFFSCacheManager

LocalStorageFFSCacheManager stores data in the browser localStorage, the data is persistence on the browser until it is cleared. 
A custom local storage can be set if the environment is not the browser, the custom implementation must have the following functions

```js
function getItem(key);
function setItem(key, value);
function removeItem(key);
```

Signature

```js
const options = {
    bucket?
    encryptor?
    decryptor?
} | localStorage;
function LocalStorageFFSCacheManager(options?);
```

Initialization Samples

```js
const ffs = require("kyofuuc");
const cacheManagers = ffs.cachemanagers;

const cacheManager1 = new cacheManagers.LocalStorageFFSCacheManager();
const cacheManager2 = new cacheManagers.LocalStorageFFSCacheManager(localStorage);
const cacheManager3 = new cacheManagers.LocalStorageFFSCacheManager({
    bucket: localStorage,
    encryptor: (value, config) => Buffer.from(value).toString('base64'),
    decryptor: (value, config) => Buffer.from(value, 'base64').toString('ascii')
});
```

#### SessionStorageFFSCacheManager

SessionStorageFFSCacheManager stores data in the browser session storage by default, the data is persistence between sessions.
It extends LocalStorageFFSCacheManager, the only difference is the default and fallback implementation is sessionStorage.

Signature

```js
const options = {
    bucket?
    encryptor?
    decryptor?
} | sessionStorage;
function SessionStorageFFSCacheManager(options?);
```

Initialization Samples

```js
const ffs = require("kyofuuc");
const cacheManagers = ffs.cachemanagers;

const cacheManager1 = new cacheManagers.SessionStorageFFSCacheManager();
const cacheManager2 = new cacheManagers.SessionStorageFFSCacheManager(sessionStorage);
const cacheManager3 = new cacheManagers.SessionStorageFFSCacheManager({
    bucket: sessionStorage,
    encryptor: (value, config) => Buffer.from(value).toString('base64'),
    decryptor: (value, config) => Buffer.from(value, 'base64').toString('ascii')
});
```

#### KonfigerFFSCacheManager

WIP

#### KeyvRedisFFSCacheManager

WIP

### Cache Examples

```js
const ffs = require("kyofuuc");
const cacheManagers = ffs.cachemanagers;
const localStorageCache = new cacheManagers.LocalStorageFFSCacheManager();

ffs.get("/profile", {
    cache: localStorageCache
}).then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});

// on the request that follows, the response will come 
// from the localStorage cache
ffs.get("/profile", {
    cache: localStorageCache
}).then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});
```

### Cache API

To create a custom cache manager the class must have the following methods declared 

```js
function constructor();
function registerInterceptors(interceptor);
function unRegisterInterceptors(interceptor);
function get(config);
function set(config, value);
function remove(config);
```

The function `registerInterceptors` and `unRegisterInterceptors` can be shadow implementation if the interceptor is not used.

The example below implements a custom cache manager

```js
const ffs = require("kyofuuc");

class CustomCacheManager {
    contructor() {
        this.bucket = {};
    }
    registerInterceptors(_) {}
    unRegisterInterceptors(_) {}
    get(config) {
        return this.bucket[config.url];
    }
    set(config, value) {
        this.bucket[config.url] = value;
    }
    remove(config) {
        delete this.bucket[config.url];
    }
}
const cacheManager = new CustomCacheManager();

ffs.get("/profile", {
    cache: cacheManager
}).then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});
```

## Request Retry

kyofuuc supports retry request if it fails. If the retry option is set to true in the request config 
the request will be retried when a new request is made, the queue retry can be force by calling 
`ffs.retryRequests()`.

Request retry uses the cache option to store a failed request and on retry the failed request is fetched 
from the cache manager.

The following example will be retried if it fails 5 times.

```js
const ffs = require("kyofuuc");
const cacheManagers = ffs.cachemanagers;
const localStorageCache = new cacheManagers.LocalStorageFFSCacheManager();

ffs.get("/wprofile", {
    cache: localStorageCache,
    retry: true,
    maxRetry: 5
}).then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});
```

### Retry Callbacks

The following callbacks methods are supplied by kyofuuck to track the retry events

```js
// invoked when a new request is queued for retry
function registerQueuedEvent(cb(type, object));

// invoked when a retried request fails again before it requeued
function registerRetryFailureEvent(cb(type, object));

// invoked if a retried request was successful
function registerRetrySuccessEvent(cb(type, object));

// invoked if the request has maxed out it retry count (maxRetry)
function registerRetryMaxedOutEvent(cb(type, object));
```

Example

```js
const ffs = require("kyofuuc");
const cacheManagers = ffs.cachemanagers;
const localStorageCache = new cacheManagers.LocalStorageFFSCacheManager();

ffs.utils.registerQueuedEvent((type, object) => {
    console.log("A request queued")
});
ffs.utils.registerRetryFailureEvent((type, response) => {
    console.error("A retried request failed again")
});
ffs.utils.registerRetrySuccessEvent((type, response) => {
    console.log("A retried request was successful and will be removed from queue")
});
ffs.utils.registerRetryFailureEvent((type, object) => {
    console.error("A retried request is maxed out and will be remove from queue")
});

ffs.get("/wprofile", {
    cache: localStorageCache,
    retry: true,
    maxRetry: 2
}).then(response => {
    console.log(response);
}).catch(error => {
    console.error(error);
});
```

## Kyofuuc API

### Request Config

The following are the request config only `url` is required.

```js
{
    url: "/article",
    method: "get",
    connector: null,
    timeout: 0,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    maxRedirects: 5,
    timeout: 5000,
    responseType: "json",
    validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
    },
    headers: {
        'Accept': 'application/json, text/plain, */*'
    },
    retry: false,
    maxRetry: 99999,
    onRetryCompleted: null
}
```

### Response Schema

```js
{
    status: 200,
    statusText: "OK",
    data: null,
    body: null,
    headers: {},
    config: {},
    request: {},
    isFromCache: false
}
```

## Why

Z 

## How it works

I forgot

## Contributing

If you have any issue or you want to request a feature you can open a request [here](https://github.com/kyofuuc/kyofuuc.js/issues/new/choose) anytime and if you made some changes that should be added to the main project send in a [pull request](https://github.com/kyofuuc/kyofuuc.js/compare). 

## References

- [axios](https://github.com/axios/axios)
- [kyofuuc collections](https://kyofuuc.github.io/)
- [Author](https://thecarisma.github.io/)

## License

MIT License Copyright (c) 2022, Adewale Azeez 
