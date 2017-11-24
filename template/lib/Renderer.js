'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _memoryFs = require('memory-fs');

var _memoryFs2 = _interopRequireDefault(_memoryFs);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _vueServerRenderer = require('vue-server-renderer');

var _ssrClientPlugin = require('./plugins/ssr-client-plugin');

var _ssrClientPlugin2 = _interopRequireDefault(_ssrClientPlugin);

var _path2 = require('./utils/path');

var _webpack3 = require('./utils/webpack');

var _template = require('./utils/template');

var _template2 = _interopRequireDefault(_template);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Renderer = function () {
    function Renderer(core) {
        var _this = this;

        (0, _classCallCheck3.default)(this, Renderer);

        this.isProd = core.isProd;
        this.config = core.config;
        this.rootDir = this.config && this.config.globals.rootDir;
        this.cwd = core.cwd;
        this.internalMiddlewares = core.internalMiddlewares;
        this.renderer = {};
        this.serverBundle = null;
        this.clientManifest = {};
        this.templates = {};
        this.resolve = null;
        this.readyPromise = new _promise2.default(function (r) {
            return _this.resolve = r;
        });
        this.entries = this.config.entry.map(function (e) {
            return e.name;
        });
    }

    (0, _createClass3.default)(Renderer, [{
        key: 'getTemplate',
        value: function getTemplate(entryName) {
            var templateName = this.getTemplateName(entryName);
            var templatePath = (0, _path.join)(this.rootDir, 'entries/' + entryName + '/' + templateName);
            if (!_fsExtra2.default.pathExistsSync(templatePath)) {
                throw new Error(templateName + ' required for entry: ' + entryName);
            }
            return _template2.default.server(_fsExtra2.default.readFileSync(templatePath, 'utf8'));
        }
    }, {
        key: 'getTemplateName',
        value: function getTemplateName(entryName) {
            var entryConfig = this.config.entry.find(function (entry) {
                return entry.name === entryName;
            });
            if (entryConfig && entryConfig.templateFile) {
                return entryConfig.templateFile;
            } else {
                return _constants.TEMPLATE_HTML;
            }
        }
    }, {
        key: 'addSSRClientPlugin',
        value: function addSSRClientPlugin() {
            this.clientConfig.plugins.push(new _ssrClientPlugin2.default({
                filename: (0, _path.join)(_constants.LAVAS_DIRNAME_IN_DIST, '[entryName]/' + _constants.CLIENT_MANIFEST)
            }));
        }
    }, {
        key: 'createWithBundle',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var _this2 = this;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return _fsExtra2.default.readFile((0, _path2.distLavasPath)(this.cwd, _constants.SERVER_BUNDLE));

                            case 2:
                                this.serverBundle = _context2.sent;
                                _context2.next = 5;
                                return _promise2.default.all(this.config.entry.map(function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(entry) {
                                        var entryName, ssr, templatePath, manifestPath;
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        entryName = entry.name, ssr = entry.ssr;
                                                        templatePath = (0, _path2.distLavasPath)(_this2.cwd, entryName + '/' + _this2.getTemplateName(entryName));
                                                        manifestPath = (0, _path2.distLavasPath)(_this2.cwd, entryName + '/' + _constants.CLIENT_MANIFEST);

                                                        if (!ssr) {
                                                            _context.next = 10;
                                                            break;
                                                        }

                                                        _context.next = 6;
                                                        return _fsExtra2.default.readFile(templatePath, 'utf-8');

                                                    case 6:
                                                        _this2.templates[entryName] = _context.sent;
                                                        _context.next = 9;
                                                        return _fsExtra2.default.readFile(manifestPath);

                                                    case 9:
                                                        _this2.clientManifest[entryName] = _context.sent;

                                                    case 10:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this2);
                                    }));

                                    return function (_x) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }()));

                            case 5:
                                _context2.next = 7;
                                return this.createRenderer();

                            case 7:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function createWithBundle() {
                return _ref.apply(this, arguments);
            }

            return createWithBundle;
        }()
    }, {
        key: 'buildProd',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
                var _this3 = this;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                this.addSSRClientPlugin();

                                _context4.next = 3;
                                return (0, _webpack3.webpackCompile)([this.clientConfig, this.serverConfig]);

                            case 3:
                                _context4.next = 5;
                                return _promise2.default.all(this.config.entry.map(function () {
                                    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(entryConfig) {
                                        var entryName, templateContent, distTemplatePath;
                                        return _regenerator2.default.wrap(function _callee3$(_context3) {
                                            while (1) {
                                                switch (_context3.prev = _context3.next) {
                                                    case 0:
                                                        if (!entryConfig.ssr) {
                                                            _context3.next = 6;
                                                            break;
                                                        }

                                                        entryName = entryConfig.name;
                                                        templateContent = _this3.getTemplate(entryName);
                                                        distTemplatePath = (0, _path2.distLavasPath)(_this3.config.webpack.base.output.path, entryName + '/' + _this3.getTemplateName(entryName));
                                                        _context3.next = 6;
                                                        return _fsExtra2.default.outputFile(distTemplatePath, templateContent);

                                                    case 6:
                                                    case 'end':
                                                        return _context3.stop();
                                                }
                                            }
                                        }, _callee3, _this3);
                                    }));

                                    return function (_x2) {
                                        return _ref4.apply(this, arguments);
                                    };
                                }()));

                            case 5:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function buildProd() {
                return _ref3.apply(this, arguments);
            }

            return buildProd;
        }()
    }, {
        key: 'buildDev',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
                var _this4 = this;

                var clientCompiler, devMiddleware, hotMiddleware, serverCompiler;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return _promise2.default.all(this.entries.map(function () {
                                    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(entryName) {
                                        return _regenerator2.default.wrap(function _callee5$(_context5) {
                                            while (1) {
                                                switch (_context5.prev = _context5.next) {
                                                    case 0:
                                                        _this4.templates[entryName] = _this4.getTemplate(entryName);

                                                    case 1:
                                                    case 'end':
                                                        return _context5.stop();
                                                }
                                            }
                                        }, _callee5, _this4);
                                    }));

                                    return function (_x3) {
                                        return _ref6.apply(this, arguments);
                                    };
                                }()));

                            case 2:

                                (0, _webpack3.enableHotReload)(this.clientConfig);

                                this.addSSRClientPlugin();

                                clientCompiler = (0, _webpack2.default)(this.clientConfig);
                                devMiddleware = (0, _webpackDevMiddleware2.default)(clientCompiler, {
                                    publicPath: this.config.webpack.base.output.publicPath,
                                    noInfo: true
                                });

                                this.devFs = devMiddleware.fileSystem;
                                clientCompiler.outputFileSystem = this.devFs;

                                this.internalMiddlewares.push(devMiddleware);

                                hotMiddleware = (0, _webpackHotMiddleware2.default)(clientCompiler, {
                                    heartbeat: 5000
                                });


                                this.internalMiddlewares.push(hotMiddleware);

                                clientCompiler.plugin('done', function () {
                                    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(stats) {
                                        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, error;

                                        return _regenerator2.default.wrap(function _callee6$(_context6) {
                                            while (1) {
                                                switch (_context6.prev = _context6.next) {
                                                    case 0:
                                                        stats = stats.toJson();
                                                        stats.errors.forEach(function (err) {
                                                            return console.error(err);
                                                        });
                                                        stats.warnings.forEach(function (err) {
                                                            return console.warn(err);
                                                        });

                                                        if (!stats.errors.length) {
                                                            _context6.next = 24;
                                                            break;
                                                        }

                                                        _iteratorNormalCompletion = true;
                                                        _didIteratorError = false;
                                                        _iteratorError = undefined;
                                                        _context6.prev = 7;

                                                        for (_iterator = (0, _getIterator3.default)(stats.errors); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                                            error = _step.value;

                                                            console.error(error);
                                                        }
                                                        _context6.next = 15;
                                                        break;

                                                    case 11:
                                                        _context6.prev = 11;
                                                        _context6.t0 = _context6['catch'](7);
                                                        _didIteratorError = true;
                                                        _iteratorError = _context6.t0;

                                                    case 15:
                                                        _context6.prev = 15;
                                                        _context6.prev = 16;

                                                        if (!_iteratorNormalCompletion && _iterator.return) {
                                                            _iterator.return();
                                                        }

                                                    case 18:
                                                        _context6.prev = 18;

                                                        if (!_didIteratorError) {
                                                            _context6.next = 21;
                                                            break;
                                                        }

                                                        throw _iteratorError;

                                                    case 21:
                                                        return _context6.finish(18);

                                                    case 22:
                                                        return _context6.finish(15);

                                                    case 23:
                                                        return _context6.abrupt('return');

                                                    case 24:
                                                        _context6.next = 26;
                                                        return _this4.refreshFiles();

                                                    case 26:
                                                    case 'end':
                                                        return _context6.stop();
                                                }
                                            }
                                        }, _callee6, _this4, [[7, 11, 15, 23], [16,, 18, 22]]);
                                    }));

                                    return function (_x4) {
                                        return _ref7.apply(this, arguments);
                                    };
                                }());

                                serverCompiler = (0, _webpack2.default)(this.serverConfig);

                                this.mfs = new _memoryFs2.default();
                                serverCompiler.outputFileSystem = this.mfs;

                                serverCompiler.watch({}, function () {
                                    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(err, stats) {
                                        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, error;

                                        return _regenerator2.default.wrap(function _callee7$(_context7) {
                                            while (1) {
                                                switch (_context7.prev = _context7.next) {
                                                    case 0:
                                                        if (!err) {
                                                            _context7.next = 2;
                                                            break;
                                                        }

                                                        throw err;

                                                    case 2:
                                                        stats = stats.toJson();

                                                        if (!stats.errors.length) {
                                                            _context7.next = 24;
                                                            break;
                                                        }

                                                        _iteratorNormalCompletion2 = true;
                                                        _didIteratorError2 = false;
                                                        _iteratorError2 = undefined;
                                                        _context7.prev = 7;

                                                        for (_iterator2 = (0, _getIterator3.default)(stats.errors); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                                            error = _step2.value;

                                                            console.error(error);
                                                        }
                                                        _context7.next = 15;
                                                        break;

                                                    case 11:
                                                        _context7.prev = 11;
                                                        _context7.t0 = _context7['catch'](7);
                                                        _didIteratorError2 = true;
                                                        _iteratorError2 = _context7.t0;

                                                    case 15:
                                                        _context7.prev = 15;
                                                        _context7.prev = 16;

                                                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                                            _iterator2.return();
                                                        }

                                                    case 18:
                                                        _context7.prev = 18;

                                                        if (!_didIteratorError2) {
                                                            _context7.next = 21;
                                                            break;
                                                        }

                                                        throw _iteratorError2;

                                                    case 21:
                                                        return _context7.finish(18);

                                                    case 22:
                                                        return _context7.finish(15);

                                                    case 23:
                                                        return _context7.abrupt('return');

                                                    case 24:
                                                        _context7.next = 26;
                                                        return _this4.refreshFiles();

                                                    case 26:
                                                    case 'end':
                                                        return _context7.stop();
                                                }
                                            }
                                        }, _callee7, _this4, [[7, 11, 15, 23], [16,, 18, 22]]);
                                    }));

                                    return function (_x5, _x6) {
                                        return _ref8.apply(this, arguments);
                                    };
                                }());

                            case 16:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function buildDev() {
                return _ref5.apply(this, arguments);
            }

            return buildDev;
        }()
    }, {
        key: 'refreshFiles',
        value: function () {
            var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
                var _this5 = this;

                var changed, serverBundlePath, serverBundleContent;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                changed = false;

                                console.log('[Lavas] refresh ssr bundle & manifest.');
                                this.clientManifest = this.entries.reduce(function (prev, entryName) {
                                    var clientManifestPath = (0, _path2.distLavasPath)(_this5.clientConfig.output.path, entryName + '/' + _constants.CLIENT_MANIFEST);
                                    if (_this5.devFs.existsSync(clientManifestPath)) {
                                        var clientManifestContent = _this5.devFs.readFileSync(clientManifestPath, 'utf-8');

                                        prev[entryName] = JSON.parse(clientManifestContent);
                                    }
                                    return prev;
                                }, {});

                                serverBundlePath = (0, _path2.distLavasPath)(this.serverConfig.output.path, _constants.SERVER_BUNDLE);

                                if (this.mfs.existsSync(serverBundlePath)) {
                                    serverBundleContent = this.mfs.readFileSync(serverBundlePath, 'utf8');

                                    this.serverBundle = JSON.parse(serverBundleContent);
                                }

                                _context9.next = 7;
                                return this.createRenderer();

                            case 7:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function refreshFiles() {
                return _ref9.apply(this, arguments);
            }

            return refreshFiles;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(clientConfig, serverConfig) {
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                this.clientConfig = clientConfig;
                                this.serverConfig = serverConfig;

                                this.setWebpackEntries();

                                if (!this.isProd) {
                                    _context10.next = 8;
                                    break;
                                }

                                _context10.next = 6;
                                return this.buildProd();

                            case 6:
                                _context10.next = 10;
                                break;

                            case 8:
                                _context10.next = 10;
                                return this.buildDev();

                            case 10:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function build(_x7, _x8) {
                return _ref10.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'setWebpackEntries',
        value: function setWebpackEntries() {
            var _this6 = this;

            this.clientConfig.context = this.rootDir;
            this.serverConfig.context = this.rootDir;

            this.clientConfig.entry = {};
            this.clientConfig.name = 'client';
            this.config.entry.forEach(function (entryConfig) {
                if (!_this6.isProd || _this6.isProd && entryConfig.ssr) {
                    var entryName = entryConfig.name;
                    _this6.clientConfig.entry[entryName] = ['./entries/' + entryName + '/entry-client.js'];
                }
            });

            this.serverConfig.entry = './core/entry-server.js';
        }
    }, {
        key: 'createRenderer',
        value: function () {
            var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12() {
                var _this7 = this;

                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                if (!(this.serverBundle && this.clientManifest)) {
                                    _context12.next = 3;
                                    break;
                                }

                                _context12.next = 3;
                                return _promise2.default.all(this.entries.map(function () {
                                    var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(entryName) {
                                        var first;
                                        return _regenerator2.default.wrap(function _callee11$(_context11) {
                                            while (1) {
                                                switch (_context11.prev = _context11.next) {
                                                    case 0:
                                                        if (_this7.clientManifest[entryName]) {
                                                            first = !_this7.renderer[entryName];

                                                            console.log(entryName);
                                                            console.log(_this7.templates[entryName]);
                                                            _this7.renderer[entryName] = (0, _vueServerRenderer.createBundleRenderer)(_this7.serverBundle, {
                                                                template: _this7.templates[entryName],
                                                                clientManifest: _this7.clientManifest[entryName],
                                                                runInNewContext: false,
                                                                inject: false
                                                            });
                                                            if (first) {
                                                                _this7.resolve(_this7.renderer[entryName]);
                                                            }
                                                        }

                                                    case 1:
                                                    case 'end':
                                                        return _context11.stop();
                                                }
                                            }
                                        }, _callee11, _this7);
                                    }));

                                    return function (_x9) {
                                        return _ref12.apply(this, arguments);
                                    };
                                }()));

                            case 3:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function createRenderer() {
                return _ref11.apply(this, arguments);
            }

            return createRenderer;
        }()
    }, {
        key: 'getRenderer',
        value: function getRenderer(entryName) {
            if (this.renderer[entryName]) {
                return _promise2.default.resolve(this.renderer[entryName]);
            }

            return this.readyPromise;
        }
    }]);
    return Renderer;
}();

exports.default = Renderer;
module.exports = exports['default'];