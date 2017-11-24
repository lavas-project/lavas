'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fsExtra = require('fs-extra');

var _path = require('path');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _constants = require('./constants');

var _path2 = require('./utils/path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ConfigReader = function () {
    function ConfigReader(cwd, env) {
        (0, _classCallCheck3.default)(this, ConfigReader);

        this.cwd = cwd;
        this.env = env;
        this.privateFiles = [];
    }

    (0, _createClass3.default)(ConfigReader, [{
        key: 'read',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                var _this = this;

                var config, configDir, files, temp;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                config = {};
                                configDir = (0, _path.join)(this.cwd, 'config');
                                files = _glob2.default.sync('**/*.js', {
                                    cwd: configDir,
                                    ignore: '*.recommend.js'
                                });
                                _context2.next = 5;
                                return _promise2.default.all(files.map(function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(filepath) {
                                        var paths, name, cur, i;
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        filepath = filepath.substring(0, filepath.length - 3);

                                                        paths = filepath.split('/');
                                                        name = void 0;
                                                        cur = config;

                                                        for (i = 0; i < paths.length - 1; i++) {
                                                            name = paths[i];
                                                            if (!cur[name]) {
                                                                cur[name] = {};
                                                            }

                                                            cur = cur[name];
                                                        }

                                                        name = paths.pop();

                                                        _context.next = 8;
                                                        return _promise2.default.resolve().then(function () {
                                                            return require('' + (0, _path.join)(configDir, filepath));
                                                        });

                                                    case 8:
                                                        cur[name] = _context.sent;

                                                    case 9:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this);
                                    }));

                                    return function (_x) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }()));

                            case 5:
                                temp = config.env || {};

                                if (temp[this.env]) {
                                    _lodash2.default.merge(config, temp[this.env]);
                                }

                                return _context2.abrupt('return', config);

                            case 8:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function read() {
                return _ref.apply(this, arguments);
            }

            return read;
        }()
    }, {
        key: 'readConfigFile',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
                var _this2 = this;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return _promise2.default.resolve().then(function () {
                                    return require('' + (0, _path2.distLavasPath)(_this2.cwd, _constants.CONFIG_FILE));
                                });

                            case 2:
                                return _context3.abrupt('return', _context3.sent);

                            case 3:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function readConfigFile() {
                return _ref3.apply(this, arguments);
            }

            return readConfigFile;
        }()
    }, {
        key: 'writeConfigFile',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(config) {
                var configFilePath;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                configFilePath = (0, _path2.distLavasPath)(config.webpack.base.output.path, _constants.CONFIG_FILE);

                                this.privateFiles.push(_constants.CONFIG_FILE);
                                _context4.next = 4;
                                return (0, _fsExtra.ensureFile)(configFilePath);

                            case 4:
                                _context4.next = 6;
                                return (0, _fsExtra.writeFile)(configFilePath, (0, _stringify2.default)(config), 'utf8');

                            case 6:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function writeConfigFile(_x2) {
                return _ref4.apply(this, arguments);
            }

            return writeConfigFile;
        }()
    }]);
    return ConfigReader;
}();

exports.default = ConfigReader;
module.exports = exports['default'];