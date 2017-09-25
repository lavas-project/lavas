'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _routeManager = require('./route-manager');

var _routeManager2 = _interopRequireDefault(_routeManager);

var _webpack = require('./webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpack3 = require('webpack');

var _webpack4 = _interopRequireDefault(_webpack3);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _lodash = require('lodash.template');

var _lodash2 = _interopRequireDefault(_lodash);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _connectHistoryApiFallback = require('connect-history-api-fallback');

var _connectHistoryApiFallback2 = _interopRequireDefault(_connectHistoryApiFallback);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _htmlWebpackPlugin = require('html-webpack-plugin');

var _htmlWebpackPlugin2 = _interopRequireDefault(_htmlWebpackPlugin);

var _vueSkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin');

var _vueSkeletonWebpackPlugin2 = _interopRequireDefault(_vueSkeletonWebpackPlugin);

var _constants = require('./constants');

var _webpack5 = require('./utils/webpack');

var _path2 = require('./utils/path');

var _router = require('./utils/router');

var _json = require('./utils/json');

var JsonUtil = _interopRequireWildcard(_json);

var _template = require('./utils/template');

var _template2 = _interopRequireDefault(_template);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function templatesPath(path) {
    return (0, _path.join)(__dirname, 'templates', path);
}

var Builder = function () {
    function Builder(core) {
        (0, _classCallCheck3.default)(this, Builder);

        this.cwd = core.cwd;
        this.config = core.config;
        this.lavasDir = (0, _path.join)(this.config.globals.rootDir, './.lavas');
        this.renderer = core.renderer;
        this.internalMiddlewares = core.internalMiddlewares;
        this.webpackConfig = new _webpack2.default(core.config, core.env);
        this.routeManager = new _routeManager2.default(this);
        this.ssrExists = this.config.entry.some(function (e) {
            return e.ssr;
        });
        this.mpaExists = this.config.entry.some(function (e) {
            return !e.ssr;
        });
    }

    (0, _createClass3.default)(Builder, [{
        key: 'createSkeletonEntry',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(entryName, skeletonPath) {
                var skeletonEntryTemplate, entryPath, writeFile;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                skeletonEntryTemplate = templatesPath('entry-skeleton.tpl');
                                entryPath = (0, _path.join)(this.lavasDir, entryName + '/skeleton.js');
                                writeFile = this.isProd ? _fsExtra.outputFile : _webpack5.writeFileInDev;
                                _context.t0 = writeFile;
                                _context.t1 = entryPath;
                                _context.t2 = _lodash2.default;
                                _context.next = 8;
                                return (0, _fsExtra.readFile)(skeletonEntryTemplate, 'utf8');

                            case 8:
                                _context.t3 = _context.sent;
                                _context.t4 = (0, _context.t2)(_context.t3);
                                _context.t5 = {
                                    skeleton: {
                                        path: skeletonPath
                                    }
                                };
                                _context.t6 = (0, _context.t4)(_context.t5);
                                _context.next = 14;
                                return (0, _context.t0)(_context.t1, _context.t6);

                            case 14:
                                return _context.abrupt('return', entryPath);

                            case 15:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function createSkeletonEntry(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return createSkeletonEntry;
        }()
    }, {
        key: 'addHtmlPlugin',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(mpaConfig, entryName) {
                var writeFile, rootDir, htmlFilename, customTemplatePath, clientTemplateContent, realTemplatePath;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                writeFile = this.isProd ? _fsExtra.outputFile : _webpack5.writeFileInDev;
                                rootDir = this.config.globals.rootDir;
                                htmlFilename = entryName + '.html';
                                customTemplatePath = (0, _path.join)(rootDir, 'entries/' + entryName + '/' + _constants.TEMPLATE_HTML);
                                _context2.next = 6;
                                return (0, _fsExtra.pathExists)(customTemplatePath);

                            case 6:
                                if (_context2.sent) {
                                    _context2.next = 8;
                                    break;
                                }

                                throw new Error(_constants.TEMPLATE_HTML + ' required for entry: ' + name);

                            case 8:
                                _context2.t0 = _template2.default;
                                _context2.next = 11;
                                return (0, _fsExtra.readFile)(customTemplatePath, 'utf8');

                            case 11:
                                _context2.t1 = _context2.sent;
                                clientTemplateContent = _context2.t0.client.call(_context2.t0, _context2.t1);
                                realTemplatePath = (0, _path.join)(rootDir, '.lavas/' + entryName + '/' + _constants.TEMPLATE_HTML);
                                _context2.next = 16;
                                return writeFile(realTemplatePath, clientTemplateContent);

                            case 16:
                                mpaConfig.plugins.unshift(new _htmlWebpackPlugin2.default({
                                    filename: htmlFilename,
                                    template: realTemplatePath,
                                    inject: true,
                                    minify: {
                                        removeComments: true,
                                        collapseWhitespace: true,
                                        removeAttributeQuotes: true
                                    },
                                    favicon: (0, _path2.assetsPath)('img/icons/favicon.ico'),
                                    chunksSortMode: 'dependency',
                                    chunks: ['manifest', 'vue', 'vendor', entryName],
                                    config: this.config }));

                            case 17:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function addHtmlPlugin(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return addHtmlPlugin;
        }()
    }, {
        key: 'createMPAConfig',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                var _this = this;

                var rootDir, mpaConfig, skeletonEntries, skeletonConfig;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                rootDir = this.config.globals.rootDir;
                                mpaConfig = this.webpackConfig.client(this.config);
                                skeletonEntries = {};

                                mpaConfig.entry = {};
                                mpaConfig.name = 'mpaClient';
                                mpaConfig.context = rootDir;

                                _context4.next = 8;
                                return _promise2.default.all(this.config.entry.map(function () {
                                    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(entryConfig) {
                                        var entryName, needSSR, skeletonPath, skeletonImportPath, entryPath;
                                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                                            while (1) {
                                                switch (_context3.prev = _context3.next) {
                                                    case 0:
                                                        entryName = entryConfig.name, needSSR = entryConfig.ssr;

                                                        if (needSSR) {
                                                            _context3.next = 14;
                                                            break;
                                                        }

                                                        mpaConfig.entry[entryName] = ['./entries/' + entryName + '/entry-client.js'];

                                                        _context3.next = 5;
                                                        return _this.addHtmlPlugin(mpaConfig, entryName);

                                                    case 5:
                                                        skeletonPath = (0, _path.join)(rootDir, 'entries/' + entryName + '/skeleton.vue');
                                                        skeletonImportPath = '@/entries/' + entryName + '/skeleton.vue';
                                                        _context3.next = 9;
                                                        return (0, _fsExtra.pathExists)(skeletonPath);

                                                    case 9:
                                                        if (!_context3.sent) {
                                                            _context3.next = 14;
                                                            break;
                                                        }

                                                        _context3.next = 12;
                                                        return _this.createSkeletonEntry(entryName, skeletonImportPath);

                                                    case 12:
                                                        entryPath = _context3.sent;

                                                        skeletonEntries[entryName] = [entryPath];

                                                    case 14:
                                                    case 'end':
                                                        return _context3.stop();
                                                }
                                            }
                                        }, _callee3, _this);
                                    }));

                                    return function (_x5) {
                                        return _ref4.apply(this, arguments);
                                    };
                                }()));

                            case 8:

                                if ((0, _keys2.default)(skeletonEntries).length) {
                                    skeletonConfig = this.webpackConfig.server(this.config);

                                    skeletonConfig.plugins.pop();
                                    skeletonConfig.entry = skeletonEntries;

                                    mpaConfig.plugins.push(new _vueSkeletonWebpackPlugin2.default({
                                        webpackConfig: skeletonConfig
                                    }));
                                }

                                if (this.isDev) {
                                    (0, _webpack5.enableHotReload)(mpaConfig);
                                }
                                return _context4.abrupt('return', mpaConfig);

                            case 11:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function createMPAConfig() {
                return _ref3.apply(this, arguments);
            }

            return createMPAConfig;
        }()
    }, {
        key: 'writeConfigFile',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(config) {
                var configFilePath;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                configFilePath = (0, _path2.distLavasPath)(config.webpack.base.output.path, _constants.CONFIG_FILE);
                                _context5.next = 3;
                                return (0, _fsExtra.outputFile)(configFilePath, JsonUtil.stringify(config));

                            case 3:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function writeConfigFile(_x6) {
                return _ref5.apply(this, arguments);
            }

            return writeConfigFile;
        }()
    }, {
        key: 'copyServerModuleToDist',
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
                var distPath, libDir, distLibDir, serverDir, distServerDir, nodeModulesDir, distNodeModulesDir, jsonDir, distJsonDir;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                distPath = this.config.webpack.base.output.path;
                                libDir = (0, _path.join)(this.cwd, 'lib');
                                distLibDir = (0, _path.join)(distPath, 'lib');
                                serverDir = (0, _path.join)(this.cwd, 'server.dev.js');
                                distServerDir = (0, _path.join)(distPath, 'server.js');
                                nodeModulesDir = (0, _path.join)(this.cwd, 'node_modules');
                                distNodeModulesDir = (0, _path.join)(distPath, 'node_modules');
                                jsonDir = (0, _path.join)(this.cwd, 'package.json');
                                distJsonDir = (0, _path.join)(distPath, 'package.json');
                                _context6.next = 11;
                                return _promise2.default.all([(0, _fsExtra.copy)(libDir, distLibDir), (0, _fsExtra.copy)(serverDir, distServerDir), (0, _fsExtra.copy)(nodeModulesDir, distNodeModulesDir), (0, _fsExtra.copy)(jsonDir, distJsonDir)]);

                            case 11:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function copyServerModuleToDist() {
                return _ref6.apply(this, arguments);
            }

            return copyServerModuleToDist;
        }()
    }, {
        key: 'injectEntriesToSW',
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
                var rawTemplate, swTemplateContent, swTemplateFilePath;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return (0, _fsExtra.readFile)(templatesPath('service-worker.js.tmpl'));

                            case 2:
                                rawTemplate = _context7.sent;
                                swTemplateContent = (0, _lodash2.default)(rawTemplate, {
                                    evaluate: /{{([\s\S]+?)}}/g,
                                    interpolate: /{{=([\s\S]+?)}}/g,
                                    escape: /{{-([\s\S]+?)}}/g
                                })({
                                    entryConfig: JsonUtil.stringify(this.config.entry)
                                });
                                swTemplateFilePath = templatesPath('service-worker-real.js.tmpl');
                                _context7.next = 7;
                                return (0, _fsExtra.outputFile)(swTemplateFilePath, swTemplateContent);

                            case 7:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function injectEntriesToSW() {
                return _ref7.apply(this, arguments);
            }

            return injectEntriesToSW;
        }()
    }, {
        key: 'addSkeletonRoutes',
        value: function addSkeletonRoutes(clientConfig) {
            var _this2 = this;

            var _config = this.config,
                rootDir = _config.globals.rootDir,
                entry = _config.entry;

            var entriesWithSkeleton = entry.filter(function () {
                var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(e) {
                    var name, ssr, skeletonPath;
                    return _regenerator2.default.wrap(function _callee8$(_context8) {
                        while (1) {
                            switch (_context8.prev = _context8.next) {
                                case 0:
                                    name = e.name, ssr = e.ssr;
                                    skeletonPath = (0, _path.join)(rootDir, 'entries/' + name + '/skeleton.vue');
                                    _context8.t0 = !ssr;

                                    if (!_context8.t0) {
                                        _context8.next = 7;
                                        break;
                                    }

                                    _context8.next = 6;
                                    return (0, _fsExtra.pathExists)(skeletonPath);

                                case 6:
                                    _context8.t0 = _context8.sent;

                                case 7:
                                    return _context8.abrupt('return', _context8.t0);

                                case 8:
                                case 'end':
                                    return _context8.stop();
                            }
                        }
                    }, _callee8, _this2);
                }));

                return function (_x7) {
                    return _ref8.apply(this, arguments);
                };
            }());

            clientConfig.module.rules.push(_vueSkeletonWebpackPlugin2.default.loader({
                resource: entriesWithSkeleton.map(function (e) {
                    return (0, _path.join)(rootDir, '.lavas/' + e.name + '/routes');
                }),
                options: {
                    entry: entriesWithSkeleton.map(function (e) {
                        return e.name;
                    }),
                    importTemplate: 'import [nameCap] from \'@/entries/[name]/skeleton.vue\';',
                    routePathTemplate: '/skeleton-[name]',
                    insertAfter: 'let routes = ['
                }
            }));
        }
    }, {
        key: 'buildDev',
        value: function () {
            var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
                var clientConfig, serverConfig, mpaConfig, compiler, devMiddleware, hotMiddleware, mpaEntries;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                this.isDev = true;
                                clientConfig = this.webpackConfig.client(this.config);
                                serverConfig = this.webpackConfig.server(this.config);
                                _context9.next = 5;
                                return this.routeManager.buildRoutes();

                            case 5:
                                if (!this.ssrExists) {
                                    _context9.next = 10;
                                    break;
                                }

                                console.log('[Lavas] SSR build starting...');
                                _context9.next = 9;
                                return this.renderer.build(clientConfig, serverConfig);

                            case 9:
                                console.log('[Lavas] SSR build completed.');

                            case 10:
                                if (!this.mpaExists) {
                                    _context9.next = 25;
                                    break;
                                }

                                console.log('[Lavas] MPA build starting...');

                                _context9.next = 14;
                                return this.createMPAConfig();

                            case 14:
                                mpaConfig = _context9.sent;

                                this.addSkeletonRoutes(mpaConfig);

                                compiler = (0, _webpack4.default)(mpaConfig);
                                devMiddleware = (0, _webpackDevMiddleware2.default)(compiler, {
                                    publicPath: clientConfig.output.publicPath,
                                    noInfo: true
                                });
                                hotMiddleware = (0, _webpackHotMiddleware2.default)(compiler, {
                                    heartbeat: 5000
                                });

                                compiler.plugin('compilation', function (compilation) {
                                    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
                                        hotMiddleware.publish({
                                            action: 'reload'
                                        });
                                        cb();
                                    });
                                });

                                mpaEntries = this.config.entry.filter(function (e) {
                                    return !e.ssr;
                                });

                                this.internalMiddlewares.push((0, _connectHistoryApiFallback2.default)({
                                    htmlAcceptHeaders: ['text/html'],
                                    rewrites: mpaEntries.map(function (entry) {
                                        var name = entry.name,
                                            routes = entry.routes;

                                        return {
                                            from: (0, _router.routes2Reg)(routes),
                                            to: '/' + name + '.html'
                                        };
                                    })
                                }));

                                this.internalMiddlewares.push(devMiddleware);
                                this.internalMiddlewares.push(hotMiddleware);
                                console.log('[Lavas] MPA build completed.');

                            case 25:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function buildDev() {
                return _ref9.apply(this, arguments);
            }

            return buildDev;
        }()
    }, {
        key: 'buildProd',
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10() {
                var clientConfig, serverConfig;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                this.isProd = true;
                                _context10.next = 3;
                                return (0, _fsExtra.emptyDir)(this.config.webpack.base.output.path);

                            case 3:
                                _context10.next = 5;
                                return this.injectEntriesToSW();

                            case 5:
                                _context10.next = 7;
                                return this.routeManager.buildRoutes();

                            case 7:
                                if (!this.ssrExists) {
                                    _context10.next = 16;
                                    break;
                                }

                                console.log('[Lavas] SSR build starting...');
                                clientConfig = this.webpackConfig.client(this.config);
                                serverConfig = this.webpackConfig.server(this.config);
                                _context10.next = 13;
                                return this.renderer.build(clientConfig, serverConfig);

                            case 13:
                                _context10.next = 15;
                                return _promise2.default.all([this.writeConfigFile(this.config), this.copyServerModuleToDist()]);

                            case 15:
                                console.log('[Lavas] SSR build completed.');

                            case 16:
                                if (!this.mpaExists) {
                                    _context10.next = 24;
                                    break;
                                }

                                console.log('[Lavas] MPA build starting...');
                                _context10.t0 = _webpack5.webpackCompile;
                                _context10.next = 21;
                                return this.createMPAConfig();

                            case 21:
                                _context10.t1 = _context10.sent;
                                (0, _context10.t0)(_context10.t1);

                                console.log('[Lavas] MPA build completed.');

                            case 24:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function buildProd() {
                return _ref10.apply(this, arguments);
            }

            return buildProd;
        }()
    }]);
    return Builder;
}();

exports.default = Builder;
module.exports = exports['default'];