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

var _json = require('./utils/json');

var JsonUtil = _interopRequireWildcard(_json);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ConfigReader = function () {
    function ConfigReader(cwd, env) {
        (0, _classCallCheck3.default)(this, ConfigReader);

        this.cwd = cwd;
        this.env = env;
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
                                config = {
                                    buildVersion: Date.now()
                                };
                                configDir = (0, _path.join)(this.cwd, 'config');
                                files = _glob2.default.sync('**/*.js', {
                                    cwd: configDir
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
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.t0 = JsonUtil;
                                _context3.next = 3;
                                return (0, _fsExtra.readFile)((0, _path2.distLavasPath)(this.cwd, _constants.CONFIG_FILE), 'utf8');

                            case 3:
                                _context3.t1 = _context3.sent;
                                return _context3.abrupt('return', _context3.t0.parse.call(_context3.t0, _context3.t1));

                            case 5:
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
    }]);
    return ConfigReader;
}();

exports.default = ConfigReader;
module.exports = exports['default'];