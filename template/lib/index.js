'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _renderer = require('./renderer');

var _renderer2 = _interopRequireDefault(_renderer);

var _configReader = require('./config-reader');

var _configReader2 = _interopRequireDefault(_configReader);

var _builder = require('./builder');

var _builder2 = _interopRequireDefault(_builder);

var _privateFile = require('./middlewares/privateFile');

var _privateFile2 = _interopRequireDefault(_privateFile);

var _ssr = require('./middlewares/ssr');

var _ssr2 = _interopRequireDefault(_ssr);

var _koaError = require('./middlewares/koaError');

var _koaError2 = _interopRequireDefault(_koaError);

var _expressError = require('./middlewares/expressError');

var _expressError2 = _interopRequireDefault(_expressError);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _composeMiddleware = require('compose-middleware');

var _koaCompose = require('koa-compose');

var _koaCompose2 = _interopRequireDefault(_koaCompose);

var _koaConnect = require('koa-connect');

var _koaConnect2 = _interopRequireDefault(_koaConnect);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LavasCore = function () {
    function LavasCore() {
        var cwd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : process.cwd();
        (0, _classCallCheck3.default)(this, LavasCore);

        this.cwd = cwd;
    }

    (0, _createClass3.default)(LavasCore, [{
        key: 'init',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(env, isInBuild) {
                var faviconPath;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.env = env;
                                this.isProd = this.env === 'production';
                                this.configReader = new _configReader2.default(this.cwd, this.env);
                                this.internalMiddlewares = [];

                                if (!isInBuild) {
                                    _context.next = 12;
                                    break;
                                }

                                _context.next = 7;
                                return this.configReader.read();

                            case 7:
                                this.config = _context.sent;

                                this.renderer = new _renderer2.default(this);
                                this.builder = new _builder2.default(this);
                                _context.next = 15;
                                break;

                            case 12:
                                _context.next = 14;
                                return this.configReader.readConfigFile();

                            case 14:
                                this.config = _context.sent;

                            case 15:
                                if (!(isInBuild && this.isProd)) {
                                    if (this.isProd) {
                                        this.internalMiddlewares.push((0, _serveStatic2.default)(this.cwd));
                                    }
                                    faviconPath = (0, _path.join)(this.cwd, 'static/img/icons', 'favicon.ico');

                                    this.internalMiddlewares.push((0, _serveFavicon2.default)(faviconPath));
                                }

                            case 16:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function init(_x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return init;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var spinner;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                spinner = (0, _ora2.default)();

                                spinner.start();

                                if (!this.isProd) {
                                    _context2.next = 7;
                                    break;
                                }

                                _context2.next = 5;
                                return this.builder.buildProd();

                            case 5:
                                _context2.next = 9;
                                break;

                            case 7:
                                _context2.next = 9;
                                return this.builder.buildDev();

                            case 9:
                                spinner.succeed('[Lavas] ' + this.env + ' build completed.');

                            case 10:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function build() {
                return _ref2.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'runAfterBuild',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                this.renderer = new _renderer2.default(this);
                                _context3.next = 3;
                                return this.renderer.createWithBundle();

                            case 3:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function runAfterBuild() {
                return _ref3.apply(this, arguments);
            }

            return runAfterBuild;
        }()
    }, {
        key: 'koaMiddleware',
        value: function koaMiddleware() {
            var ssrExists = this.config.entry.some(function (e) {
                return e.ssr;
            });

            return (0, _koaCompose2.default)([(0, _koaError2.default)(this), function () {
                var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(ctx, next) {
                    return _regenerator2.default.wrap(function _callee4$(_context4) {
                        while (1) {
                            switch (_context4.prev = _context4.next) {
                                case 0:
                                    ctx.status = 200;
                                    _context4.next = 3;
                                    return next();

                                case 3:
                                case 'end':
                                    return _context4.stop();
                            }
                        }
                    }, _callee4, this);
                }));

                return function (_x4, _x5) {
                    return _ref4.apply(this, arguments);
                };
            }(), (0, _koaConnect2.default)((0, _privateFile2.default)(this))].concat((0, _toConsumableArray3.default)(this.internalMiddlewares.map(_koaConnect2.default)), [ssrExists ? (0, _koaConnect2.default)((0, _ssr2.default)(this)) : function () {}]));
        }
    }, {
        key: 'expressMiddleware',
        value: function expressMiddleware() {
            var ssrExists = this.config.entry.some(function (e) {
                return e.ssr;
            });
            return (0, _composeMiddleware.compose)([(0, _privateFile2.default)(this)].concat((0, _toConsumableArray3.default)(this.internalMiddlewares), [ssrExists ? (0, _ssr2.default)(this) : function () {}, (0, _expressError2.default)(this)]));
        }
    }]);
    return LavasCore;
}();

exports.default = LavasCore;
module.exports = exports['default'];