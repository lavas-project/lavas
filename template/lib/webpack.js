'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _path = require('path');

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _webpackNodeExternals = require('webpack-node-externals');

var _webpackNodeExternals2 = _interopRequireDefault(_webpackNodeExternals);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _friendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

var _friendlyErrorsWebpackPlugin2 = _interopRequireDefault(_friendlyErrorsWebpackPlugin);

var _optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

var _optimizeCssAssetsWebpackPlugin2 = _interopRequireDefault(_optimizeCssAssetsWebpackPlugin);

var _copyWebpackPlugin = require('copy-webpack-plugin');

var _copyWebpackPlugin2 = _interopRequireDefault(_copyWebpackPlugin);

var _serverPlugin = require('vue-server-renderer/server-plugin');

var _serverPlugin2 = _interopRequireDefault(_serverPlugin);

var _webpackBundleAnalyzer = require('webpack-bundle-analyzer');

var _webpackBundleAnalyzer2 = _interopRequireDefault(_webpackBundleAnalyzer);

var _manifestJsonWebpackPlugin = require('./plugins/manifest-json-webpack-plugin');

var _manifestJsonWebpackPlugin2 = _interopRequireDefault(_manifestJsonWebpackPlugin);

var _swPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

var _swPrecacheWebpackPlugin2 = _interopRequireDefault(_swPrecacheWebpackPlugin);

var _swRegisterWebpackPlugin = require('sw-register-webpack-plugin');

var _swRegisterWebpackPlugin2 = _interopRequireDefault(_swRegisterWebpackPlugin);

var _loader = require('./utils/loader');

var _path2 = require('./utils/path');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebpackConfig = function () {
    function WebpackConfig() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var env = arguments[1];
        (0, _classCallCheck3.default)(this, WebpackConfig);

        this.config = config;
        this.env = env;
        this.hooks = {};
    }

    (0, _createClass3.default)(WebpackConfig, [{
        key: 'base',
        value: function base(config) {
            var isProd = this.env === 'production';
            var globals = config.globals,
                webpackConfig = config.webpack,
                babel = config.babel,
                swPrecacheConfig = config.serviceWorker,
                routes = config.routes;
            var base = webpackConfig.base,
                shortcuts = webpackConfig.shortcuts,
                _webpackConfig$mergeS = webpackConfig.mergeStrategy,
                mergeStrategy = _webpackConfig$mergeS === undefined ? {} : _webpackConfig$mergeS,
                extend = webpackConfig.extend;
            var cssSourceMap = shortcuts.cssSourceMap,
                cssMinimize = shortcuts.cssMinimize,
                cssExtract = shortcuts.cssExtract,
                jsSourceMap = shortcuts.jsSourceMap;


            var baseConfig = _webpackMerge2.default.strategy(mergeStrategy)({
                resolve: {
                    extensions: ['.js', '.vue', '.json'],
                    alias: {
                        '@': globals.rootDir,
                        '$': (0, _path.join)(globals.rootDir, '.lavas')
                    }
                },
                module: {
                    rules: [{
                        test: /\.vue$/,
                        use: [{
                            loader: 'vue-loader',
                            options: (0, _loader.vueLoaders)({
                                cssSourceMap: cssSourceMap,
                                cssMinimize: cssMinimize,
                                cssExtract: cssExtract
                            })
                        }]
                    }, {
                        test: /\.js$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: babel.presets,
                                plugins: babel.plugins
                            }
                        },
                        exclude: /node_modules/
                    }, {
                        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: (0, _path2.assetsPath)('img/[name].[hash:7].[ext]')
                        }
                    }, {
                        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: (0, _path2.assetsPath)('fonts/[name].[hash:7].[ext]')
                        }
                    }]
                },
                plugins: isProd ? [new _webpack2.default.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false
                    },
                    sourceMap: jsSourceMap
                }), new _optimizeCssAssetsWebpackPlugin2.default({
                    cssProcessorOptions: {
                        safe: true
                    }
                }), new _swPrecacheWebpackPlugin2.default((0, _assign2.default)(swPrecacheConfig, {
                    templateFilePath: (0, _path.resolve)(__dirname, 'templates/service-worker-real.js.tmpl')
                })), new _swRegisterWebpackPlugin2.default({
                    filePath: (0, _path.resolve)(__dirname, 'templates/sw-register.js')
                })] : [new _friendlyErrorsWebpackPlugin2.default()]
            }, base);

            if (cssExtract) {
                baseConfig.plugins.unshift(new _extractTextWebpackPlugin2.default({
                    filename: (0, _path2.assetsPath)('css/[name].[contenthash].css')
                }));
            }

            if (typeof extend === 'function') {
                extend.call(this, baseConfig, {
                    type: 'base',
                    env: this.env
                });
            }

            return baseConfig;
        }
    }, {
        key: 'client',
        value: function client(config) {
            var webpackConfig = config.webpack;
            var client = webpackConfig.client,
                shortcuts = webpackConfig.shortcuts,
                _webpackConfig$mergeS2 = webpackConfig.mergeStrategy,
                mergeStrategy = _webpackConfig$mergeS2 === undefined ? {} : _webpackConfig$mergeS2,
                extend = webpackConfig.extend;
            var ssr = shortcuts.ssr,
                cssSourceMap = shortcuts.cssSourceMap,
                cssMinimize = shortcuts.cssMinimize,
                cssExtract = shortcuts.cssExtract,
                jsSourceMap = shortcuts.jsSourceMap,
                assetsDir = shortcuts.assetsDir,
                copyDir = shortcuts.copyDir,
                bundleAnalyzerReport = shortcuts.bundleAnalyzerReport;


            var baseConfig = this.base(config);
            var clientConfig = _webpackMerge2.default.strategy(mergeStrategy)(baseConfig, {
                output: {
                    filename: (0, _path2.assetsPath)(baseConfig.output.filename),
                    chunkFilename: (0, _path2.assetsPath)('js/[name].[chunkhash:8].js')
                },
                module: {
                    rules: (0, _loader.styleLoaders)({
                        cssSourceMap: cssSourceMap,
                        cssMinimize: cssMinimize,
                        cssExtract: cssExtract
                    })
                },
                devtool: jsSourceMap ? '#source-map' : false,
                plugins: [new _webpack2.default.DefinePlugin({
                    'process.env.VUE_ENV': '"client"',
                    'process.env.NODE_ENV': '"' + this.env + '"'
                }), new _webpack2.default.optimize.CommonsChunkPlugin({
                    name: 'vendor',
                    minChunks: function minChunks(module, count) {
                        return module.resource && /\.js$/.test(module.resource) && module.resource.indexOf('node_modules') >= 0;
                    }
                }), new _webpack2.default.optimize.CommonsChunkPlugin({
                    name: 'vue',
                    minChunks: function minChunks(module, count) {
                        var context = module.context;
                        var matchContext = context ? context.split(_path.sep).join('::') : '';
                        var targets = ['vue', 'vue-router', 'vuex', 'vue-meta'];

                        var npmRegExp = new RegExp(targets.join('|'), 'i');

                        var cnpmRegExp = new RegExp(targets.map(function (t) {
                            return '_' + t + '@\\d\\.\\d\\.\\d@' + t;
                        }).join('|'), 'i');

                        return context && matchContext.indexOf('node_modules') !== -1 && (npmRegExp.test(matchContext) || cnpmRegExp.test(matchContext));
                    }
                }), new _webpack2.default.optimize.CommonsChunkPlugin({
                    name: 'manifest',
                    chunks: ['vue']
                }), new _copyWebpackPlugin2.default([{
                    from: copyDir,
                    to: assetsDir,
                    ignore: ['.*']
                }]), new _manifestJsonWebpackPlugin2.default({
                    config: this.config.manifest,
                    path: (0, _path2.assetsPath)('manifest.json')
                })]
            }, client);

            if (bundleAnalyzerReport) {
                clientConfig.plugins.push(new _webpackBundleAnalyzer2.default((0, _assign2.default)({}, bundleAnalyzerReport)));
            }

            if (typeof extend === 'function') {
                extend.call(this, clientConfig, {
                    type: 'client',
                    env: this.env
                });
            }

            return clientConfig;
        }
    }, {
        key: 'server',
        value: function server(config) {
            var webpackConfig = config.webpack;
            var server = webpackConfig.server,
                _webpackConfig$mergeS3 = webpackConfig.mergeStrategy,
                mergeStrategy = _webpackConfig$mergeS3 === undefined ? {} : _webpackConfig$mergeS3,
                extend = webpackConfig.extend;


            var baseConfig = this.base(config);
            var serverConfig = _webpackMerge2.default.strategy(mergeStrategy)(baseConfig, {
                target: 'node',
                output: {
                    filename: 'server-bundle.js',
                    libraryTarget: 'commonjs2'
                },
                resolve: {},

                externals: (0, _webpackNodeExternals2.default)({
                    whitelist: [/\.(css|vue)$/]
                }),
                plugins: [new _webpack2.default.DefinePlugin({
                    'process.env.VUE_ENV': '"server"',
                    'process.env.NODE_ENV': '"' + this.env + '"'
                }), new _serverPlugin2.default({
                    filename: (0, _path.join)(_constants.LAVAS_DIRNAME_IN_DIST, _constants.SERVER_BUNDLE)
                })]
            }, server);

            if (typeof extend === 'function') {
                extend.call(this, serverConfig, {
                    type: 'server',
                    env: this.env
                });
            }

            return serverConfig;
        }
    }]);
    return WebpackConfig;
}();

exports.default = WebpackConfig;
module.exports = exports['default'];