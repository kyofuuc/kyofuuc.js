# kyofuuc.js

Most ideas and source is from express.js


to build dist

```
npm install -g uglify-js
npm install -g browserify
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