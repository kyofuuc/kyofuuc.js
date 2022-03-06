# kyofuuc.js

Most ideas and source is from express.js


to build dist

```
npm install --save-dev uglify-js browserify
browserify index.js --s kyofuuc -o dist/kyofuuc.js
browserify index.js --s kyofuuc | uglifyjs > dist/kyofuuc.min.js
```


Docs hint, 
for cookie cache manager, extra cookie props can be pass in the config with key
cacheOptions: {}, e.g.

```
cacheOptions: {
	SameSite: "None",
	Secure: true
}
```

http configs
```
{
	storeRedirectsData: false,
	withCredentials: false,
	cache: null,
	refreshCache: true,
	invalidateCache: true
}
```

ws configs
```
{
	protocol: [ 'json' ]
	refreshCache: true,
	invalidateCache: true
}
```

remove when invalidateCache is true
do not use cache value if refreshCache is true

TODO

- [ ] if possible track cache size
- [ ] add encryptor and decryptor to MapFFSCacheManager