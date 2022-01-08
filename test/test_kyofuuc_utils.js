
const assert = require('assert');
const utils = require('../lib/utils');

it('utils.forEach', () => {
	utils.forEach(["get", "post", "patch", "delete"], function (method, key) {
		if (key == 0) assert.equal(method, "get");
		if (key == 1) assert.equal(method, "post");
		if (key == 2) assert.equal(method, "patch");
		if (key == 3) assert.equal(method, "delete");
	});
	utils.forEach([], function (method, key) {
		assert.equal(1, 2);
	});
});

it('utils.mergeObject', () => {
	const obj1 = {
		url: "test.com/user",
		method: "GET"
	};
	const obj2 = {
		baseUrl: "https://base.com",
		method: "POST"
	};
	const merged = utils.mergeObject(obj1, obj2);

	assert.equal(merged.url, obj1.url);
	assert.equal(merged.baseUrl, obj2.baseUrl);
	assert.notEqual(merged.method, obj2.method);
	assert.equal(merged.method, obj1.method);
});

it('utils.isURLSearchParams', () => {
	let url = new URL('https://example.com?foo=1&bar=2');
	let params = new URLSearchParams(url.search);
	var params2 = new URLSearchParams("foo=1&bar=2");
	var params2a = new URLSearchParams("?foo=1&bar=2");
	var params3 = new URLSearchParams([["foo", "1"], ["bar", "2"]]);
	var params4 = new URLSearchParams({"foo": "1", "bar": "2"});

	assert.equal(utils.isURLSearchParams(params), true);
	assert.equal(utils.isURLSearchParams(params2), true);
	assert.equal(utils.isURLSearchParams(params2a), true);
	assert.equal(utils.isURLSearchParams(params3), true);
	assert.equal(utils.isURLSearchParams(params4), true);
	assert.equal(utils.isURLSearchParams(params2.toString()), false);
});

it('utils.encodeParamURI', () => {
	assert.equal(utils.encodeParamURI("What [] is this"), "What+[]+is+this");
	assert.equal(utils.encodeParamURI("+:8374387[]dfyu$%#%"), "%2B:8374387[]dfyu$%25%23%25");
	assert.equal(utils.encodeParamURI("user:thecarisma&year:2022&planet:earth"), "user:thecarisma%26year:2022%26planet:earth");
	assert.equal(utils.encodeParamURI("user=thecarisma&year=2022&planet=earth"), "user%3Dthecarisma%26year%3D2022%26planet%3Dearth");
});

function customParamsSerializer(params) {
	let serializedParams = [];
	for (var key in params) {
		serializedParams.push(`CPS_${key}=VALUE_${params[key]}_END`);
	}
	return serializedParams;
}

it('utils.buildURL', () => {
	const params = {
		name: "thecarisma",
		year: 2022,
		planet: "Earth"
	};
	const url = new URL('https://example.com?foo=1&bar=2');
	const urlSearchParams = new URLSearchParams(url.search);
	const urlSearchParams2 = new URLSearchParams("foo=1&bar=2");
	const urlSearchParams2a = new URLSearchParams("?foo=1&bar=2");
	const urlSearchParams3 = new URLSearchParams([["foo", "1"], ["bar", "2"]]);
	const urlSearchParams4 = new URLSearchParams({"foo": "1", "bar": "2"});
	const urlSearchParams5 = new URLSearchParams(params);

	assert.equal(utils.buildURL("https://thecarisma.github.io", params, customParamsSerializer),
		"https://thecarisma.github.io?CPS_name=VALUE_thecarisma_END,CPS_year=VALUE_2022_END,CPS_planet=VALUE_Earth_END");
	assert.equal(utils.buildURL("https://thecarisma.github.io", urlSearchParams), "https://thecarisma.github.io?foo=1&bar=2");
	assert.equal(utils.buildURL("https://thecarisma.github.io", urlSearchParams2), "https://thecarisma.github.io?foo=1&bar=2");
	assert.equal(utils.buildURL("https://thecarisma.github.io", urlSearchParams2a), "https://thecarisma.github.io?foo=1&bar=2");
	assert.equal(utils.buildURL("https://thecarisma.github.io", urlSearchParams3), "https://thecarisma.github.io?foo=1&bar=2");
	assert.equal(utils.buildURL("https://thecarisma.github.io", urlSearchParams4), "https://thecarisma.github.io?foo=1&bar=2");
	assert.equal(utils.buildURL("https://thecarisma.github.io", urlSearchParams5), "https://thecarisma.github.io?name=thecarisma&year=2022&planet=Earth");
	assert.equal(utils.buildURL("https://thecarisma.github.io", params), "https://thecarisma.github.io?name=thecarisma&year=2022&planet=Earth");
	assert.equal(utils.buildURL("https://thecarisma.github.io", params), utils.buildURL("https://thecarisma.github.io", urlSearchParams5));
});

it('utils.buildURL types', () => {
	const date = new Date();
	const params = {
		name: "thecarisma",
		years: [2022, 2023, "beyound"],
		age: 5677,
		planet: "Earth",
		time: date
	};

	assert.equal(utils.buildURL("https://thecarisma.github.io", params), 
		"https://thecarisma.github.io?name=thecarisma&years[]=2022&years[]=2023&years[]=beyound&age=5677&planet=Earth&time=" + date.toISOString());
});

it('utils.kyofuucError', () => {
	const kError1 = utils.kyofuucError("Test Error 1", {});
	const kError2 = utils.kyofuucError("Test Error 2", { url: "https://thecarisma.github.io"});
	const kError3 = utils.kyofuucError(
		"Test Error 3", 
		{
			url: "https://thecarisma.github.io"
		},
		utils.ERROR_CODES.UNKNOWN_ERRORS);

	assert.equal(kError1.message, "Test Error 1");
	assert.equal(kError2.message, "Test Error 2");
	assert.equal(kError3.message, "Test Error 3");
	assert.deepEqual(kError1.toJSON().config, {});
	assert.deepEqual(kError2.toJSON().config, { url: "https://thecarisma.github.io"});
	assert.deepEqual(kError3.toJSON().config, { url: "https://thecarisma.github.io"});
	assert.deepEqual(kError3.toJSON().code, utils.ERROR_CODES.UNKNOWN_ERRORS);
});

it('utils.isAbsoluteURL', () => {
	assert.equal(utils.isAbsoluteURL("http://google.com"), true);
	assert.equal(utils.isAbsoluteURL("google.com"), false);
	assert.equal(utils.isAbsoluteURL("https://thecarisma.github.io"), true);
	assert.equal(utils.isAbsoluteURL("/user/token"), false);
});

it('utils.isRelativeURL', () => {
	assert.equal(utils.isRelativeURL("http://google.com"), false);
	assert.equal(utils.isRelativeURL("google.com"), true);
	assert.equal(utils.isRelativeURL("https://thecarisma.github.io"), false);
	assert.equal(utils.isRelativeURL("/user/token"), true);
});

it('utils.combineURLs', () => {
	assert.equal(utils.combineURLs("https://thecarisma.github.io/", "/user/token"), "https://thecarisma.github.io/user/token")
	assert.equal(utils.combineURLs("google.com", "search"), "google.com/search");
});

it('utils.buildFullURLPath', () => {
	assert.equal(utils.buildFullURLPath("google.com", "search"), "google.com/search");
	assert.equal(utils.buildFullURLPath("google.com", "http://search.com"), "http://search.com");
});

it('utils.mergeClassAttribute', () => {

});

it('utils.mergeClassPrototypes', () => {

});

it('utils.mergeClasses', () => {

});

