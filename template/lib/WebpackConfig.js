'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

var _lodash = require('lodash.template');

var _lodash2 = _interopRequireDefault(_lodash);

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

var _clientPlugin = require('vue-server-renderer/client-plugin');

var _clientPlugin2 = _interopRequireDefault(_clientPlugin);

var _serverPlugin = require('vue-server-renderer/server-plugin');

var _serverPlugin2 = _interopRequireDefault(_serverPlugin);

var _webpackBundleAnalyzer = require('webpack-bundle-analyzer');

var _webpackBundleAnalyzer2 = _interopRequireDefault(_webpackBundleAnalyzer);

var _manifestJsonWebpackPlugin = require('./buildinPlugins/manifest-json-webpack-plugin');

var _manifestJsonWebpackPlugin2 = _interopRequireDefault(_manifestJsonWebpackPlugin);

var _swPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

var _swPrecacheWebpackPlugin2 = _interopRequireDefault(_swPrecacheWebpackPlugin);

var _swRegisterWebpackPlugin = require('sw-register-webpack-plugin');

var _swRegisterWebpackPlugin2 = _interopRequireDefault(_swRegisterWebpackPlugin);

var _loader = require('./utils/loader');

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
        key: 'assetsPath',
        value: function assetsPath(sourcePath) {
            return _path.posix.join(this.config.webpack.shortcuts.assetsDir, sourcePath);
        }
    }, {
        key: 'addHooks',
        value: function addHooks(hooks) {
            var _this = this;

            (0, _keys2.default)(hooks).forEach(function (hookKey) {
                var hook = hooks[hookKey];
                if (!_this.hooks[hookKey]) {
                    _this.hooks[hookKey] = [];
                }
                if (hook && typeof hook === 'function') {
                    _this.hooks[hookKey].push(hook);
                }
            });
        }
    }, {
        key: 'executeHooks',
        value: function executeHooks(type, config) {
            if (this.hooks[type]) {
                this.hooks[type].forEach(function (hook) {
                    hook.call(null, config);
                });
            }
        }
    }, {
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

            var swTemplateContent = (0, _lodash2.default)(_fsExtra2.default.readFileSync((0, _path.resolve)(__dirname, 'templates/service-worker.js.tmpl')), {
                evaluate: /{{([\s\S]+?)}}/g,
                interpolate: /{{=([\s\S]+?)}}/g,
                escape: /{{-([\s\S]+?)}}/g
            })({
                routes: (0, _stringify2.default)(routes)
            });
            var swTemplateFilePath = (0, _path.resolve)(__dirname, 'templates/service-worker-real.js.tmpl');
            _fsExtra2.default.writeFileSync(swTemplateFilePath, swTemplateContent);

            swPrecacheConfig.templateFilePath = swTemplateFilePath;

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
                            name: this.assetsPath('img/[name].[hash:7].[ext]')
                        }
                    }, {
                        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: this.assetsPath('fonts/[name].[hash:7].[ext]')
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
                }), new _swPrecacheWebpackPlugin2.default(swPrecacheConfig), new _swRegisterWebpackPlugin2.default({
                    filePath: (0, _path.resolve)(__dirname, 'templates/sw-register.js')
                })] : [new _friendlyErrorsWebpackPlugin2.default()]
            }, base);

            if (cssExtract) {
                baseConfig.plugins.unshift(new _extractTextWebpackPlugin2.default({
                    filename: this.assetsPath('css/[name].[contenthash].css')
                }));
            }

            if (typeof extend === 'function') {
                extend.call(this, baseConfig, {
                    type: 'base',
                    env: this.env
                });
            }

            this.executeHooks('base', baseConfig);

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
                    filename: this.assetsPath(baseConfig.output.filename),
                    chunkFilename: this.assetsPath('js/[name].[chunkhash:8].js')
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
                        var targets = ['vue', 'vue-router', 'vuex', 'vue-meta'];
                        return context && context.indexOf('node_modules') >= 0 && targets.find(function (t) {
                            var npmRegExp = new RegExp('/' + t + '/', 'i');

                            var cnpmRegExp = new RegExp('/_' + t + '@\\d\\.\\d\\.\\d@' + t + '/', 'i');
                            return npmRegExp.test(context) || cnpmRegExp.test(context);
                        });
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
                    path: this.assetsPath('manifest.json')
                })]
            }, client);

            if (ssr) {
                clientConfig.plugins.push(new _clientPlugin2.default({
                    filename: (0, _path.join)(_constants.LAVAS_DIRNAME_IN_DIST, _constants.CLIENT_MANIFEST)
                }));
            }

            if (bundleAnalyzerReport) {
                clientConfig.plugins.push(new _webpackBundleAnalyzer2.default((0, _assign2.default)({}, bundleAnalyzerReport)));
            }

            if (typeof extend === 'function') {
                extend.call(this, clientConfig, {
                    type: 'client',
                    env: this.env
                });
            }

            this.executeHooks('client', clientConfig);

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

            this.executeHooks('server', serverConfig);

            return serverConfig;
        }
    }]);
    return WebpackConfig;
}();

exports.default = WebpackConfig;
module.exports = exports['default'];