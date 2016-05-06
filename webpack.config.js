'use strict';

var path = require('path');
var webpack = require('webpack');
var StatsPlugin = require('stats-webpack-plugin');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var css_next = require('postcss-cssnext');
var extractTextPlugin = require("extract-text-webpack-plugin");
var nested = require('postcss-nested');
var mixins = require('postcss-mixins');
var extend = require('postcss-extend');
var short = require('postcss-short');
var pxtorem = require('postcss-pxtorem');
var postcssPseudoContent = require('postcss-pseudo-elements-content');
var mqpacker = require("css-mqpacker");
var LiveReloadPlugin = require('webpack-livereload-plugin');


// must match config.webpack.dev_server.port
var devServerPort = 3808;

// set TARGET=production on the environment to add asset fingerprints
var production = process.env.TARGET === 'production';

var config = {
  entry: {
    // Sources are expected to live in $app_root/webpack
    'application': './application.js'
  },

  output: {
    // Build assets directly in to public/webpack/, let webpack know
    // that all webpacked assets start with webpack/

    // must match config.webpack.output_dir
    path: path.join(__dirname, 'public'),
    publicPath: '/public/',
    filename: 'application.js'
  },

  resolve: {
    root: path.join(__dirname, 'public')
  },

  plugins: [
    // must match config.webpack.manifest_filename
    new StatsPlugin('manifest.json', {
      // We only need assetsByChunkName
      chunkModules: false,
      source: false,
      chunks: false,
      modules: false,
      assets: true
    }),
    new extractTextPlugin("webpack.css"),
    new LiveReloadPlugin()
  ],

  module: {
    loaders: [
      {
        test:   /\.css$/,
        loader: extractTextPlugin.extract("css!postcss-loader")
      },
      {
        test: /\.(png|jpg|jpeg|ttf|eot|otf|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file?name=[name].[ext]?[hash]'
      },
      {
        test: /\.(PNG|JPG|JPEG|TTF|EOT|OTF|SVG|WOFF(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file?name=[name].[ext]?[hash]'
      }
    ]
  },

  postcss: function () {
    return [
      nested,
      mixins,
      extend,
      short,
      css_next,
      pxtorem,
      postcssPseudoContent,
      mqpacker
    ];
  }

};

if (production) {
  config.plugins.push(
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: false },
      sourceMap: false
    }),

    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('production') }
    }),

        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin()
  );
} else {

  config.devServer = {
    port: devServerPort,
    headers: { 'Access-Control-Allow-Origin': '*' }
  };

  config.output.publicPath = '//localhost:' + devServerPort + '/webpack/';
  // Source maps
  config.devtool = 'cheap-module-eval-source-map';
}

module.exports = config;
