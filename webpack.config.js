let webpack = require('webpack');
let configs = [];

function generateConfig(name) {
  let compress = name.indexOf('min') > -1;
  let config = {
    entry: './index.js',
    output: {
      path: __dirname + '/dist/',
      filename: name + '.js',
      sourceMapFilename: name + '.map',
      library: 'ffs',
      libraryTarget: 'umd',
      globalObject: 'this'
    },
    node: false,
    devtool: 'source-map',
    mode: compress ? 'production' : 'development'
  };
  return config;
}

["kyofuuc", "kyofuuc.min"].forEach(function (key) {
  configs.push(generateConfig(key));
});

module.exports = configs;
