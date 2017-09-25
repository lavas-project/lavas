

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _crypto = require('crypto');

var _lodash = require('lodash.template');

var _lodash2 = _interopRequireDefault(_lodash);

var _router = require('./utils/router');

var _path2 = require('./utils/path');

var _webpack = require('./utils/webpack');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routesTemplate = (0, _path.join)(__dirname, './templates/routes.tpl');

var RouteManager = function () {
    function RouteManager(core) {
        (0, _classCallCheck3.default)(this, RouteManager);

        this.config = core.config;
        this.env = core.env;
        this.cwd = core.cwd;

        if (this.config) {
            this.targetDir = (0, _path.join)(this.config.globals.rootDir, './.lavas');
        }

        this.routes = [];

        this.flatRoutes = new _set2.default();
    }

    (0, _createClass3.default)(RouteManager, [{
        key: 'rewriteRoutePath',
        value: function rewriteRoutePath(rewriteRules, path) {
            for (var i = 0; i < rewriteRules.length; i++) {
                var rule = rewriteRules[i];
                var from = rule.from,
                    to = rule.to;

                if (from instanceof RegExp && from.test(path)) {
                    return path.replace(from, to);
                } else if (Array.isArray(from) && from.includes(path) || typeof from === 'string' && from === path) {
                        return to;
                    }
            }
            return path;
        }
    }, {
        key: 'mergeWithConfig',
        value: function mergeWithConfig(routes) {
            var routesConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            var _this = this;

            var rewriteRules = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
            var parentPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

            var timestamp = new Date().getTime();

            routes.forEach(function (route) {
                _this.flatRoutes.add(route);

                var routeConfig = routesConfig.find(function (_ref) {
                    var pattern = _ref.pattern;

                    return pattern instanceof RegExp ? pattern.test(route.path) : pattern === route.name;
                });

                route.path = _this.rewriteRoutePath(rewriteRules, route.path);
                route.fullPath = parentPath ? parentPath + '/' + route.path : route.path;

                var entry = _this.config.entry.find(function (entryConfig) {
                    return (0, _router.matchUrl)(entryConfig.routes, route.fullPath);
                });
                if (entry) {
                    route.entryName = entry.name;
                }

                if (routeConfig) {
                    var routePath = routeConfig.path,
                        lazyLoading = routeConfig.lazyLoading,
                        chunkname = routeConfig.chunkname;


                    (0, _assign2.default)(route, routeConfig, {
                        path: routePath || route.path,
                        lazyLoading: lazyLoading || !!chunkname
                    });
                }

                if (route.name) {
                    route.hash = timestamp + (0, _crypto.createHash)('md5').update(route.name).digest('hex');
                }

                route.pathRegExp = new RegExp('^' + route.path.replace(/\/:[^\/]*/g, '/[^\/]+') + '/?');

                if (route.children && route.children.length) {
                    _this.mergeWithConfig(route.children, routeConfig && routeConfig.children, rewriteRules, route.fullPath);
                }
            });
        }
    }, {
        key: 'generateRoutesContent',
        value: function generateRoutesContent(routes) {
            var _this2 = this;

            return routes.reduce(function (prev, cur) {
                var childrenContent = '';
                if (cur.children) {
                    childrenContent = 'children: [\n                    ' + _this2.generateRoutesContent(cur.children) + '\n                ]';
                }
                return prev + ('{\n                path: \'' + cur.path + '\',\n                name: \'' + cur.name + '\',\n                component: _' + cur.hash + ',\n                meta: ' + (0, _stringify2.default)(cur.meta || {}) + ',\n                ' + childrenContent + '\n            },');
            }, '');
        }
    }, {
        key: 'writeRoutesSourceFile',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var _this3 = this;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return _promise2.default.all(this.config.entry.map(function () {
                                    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(entryConfig) {
                                        var entryName, entryRoutes, entryFlatRoutes, routesFilePath, routesContent, routesFileContent;
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        entryName = entryConfig.name;
                                                        entryRoutes = _this3.routes.filter(function (route) {
                                                            return route.entryName === entryName;
                                                        });
                                                        entryFlatRoutes = new _set2.default();

                                                        _this3.flatRoutes.forEach(function (flatRoute) {
                                                            if (flatRoute.entryName === entryName) {
                                                                entryFlatRoutes.add(flatRoute);
                                                            }
                                                        });

                                                        routesFilePath = (0, _path.join)(_this3.targetDir, entryName + '/routes.js');
                                                        routesContent = _this3.generateRoutesContent(entryRoutes);
                                                        _context.t0 = _lodash2.default;
                                                        _context.next = 9;
                                                        return (0, _fsExtra.readFile)(routesTemplate, 'utf8');

                                                    case 9:
                                                        _context.t1 = _context.sent;
                                                        _context.t2 = (0, _context.t0)(_context.t1);
                                                        _context.t3 = {
                                                            routes: entryFlatRoutes,
                                                            routesContent: routesContent
                                                        };
                                                        routesFileContent = (0, _context.t2)(_context.t3);
                                                        _context.next = 15;
                                                        return (0, _webpack.writeFileInDev)(routesFilePath, routesFileContent);

                                                    case 15:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this3);
                                    }));

                                    return function (_x4) {
                                        return _ref3.apply(this, arguments);
                                    };
                                }()));

                            case 2:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function writeRoutesSourceFile() {
                return _ref2.apply(this, arguments);
            }

            return writeRoutesSourceFile;
        }()
    }, {
        key: 'buildRoutes',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                var _config$router, _config$router$routes, routesConfig, _config$router$rewrit, rewriteRules;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _config$router = this.config.router, _config$router$routes = _config$router.routes, routesConfig = _config$router$routes === undefined ? [] : _config$router$routes, _config$router$rewrit = _config$router.rewrite, rewriteRules = _config$router$rewrit === undefined ? [] : _config$router$rewrit;


                                console.log('[Lavas] auto compile routes...');

                                _context3.next = 4;
                                return (0, _router.generateRoutes)((0, _path.join)(this.targetDir, '../pages'));

                            case 4:
                                this.routes = _context3.sent;

                                this.mergeWithConfig(this.routes, routesConfig, rewriteRules);

                                _context3.next = 8;
                                return this.writeRoutesSourceFile();

                            case 8:

                                console.log('[Lavas] all routes are already generated.');

                            case 9:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function buildRoutes() {
                return _ref4.apply(this, arguments);
            }

            return buildRoutes;
        }()
    }]);
    return RouteManager;
}();

exports.default = RouteManager;
module.exports = exports['default'];