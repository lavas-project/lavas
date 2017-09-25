'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.writeFileInDev = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var writeFileInDev = exports.writeFileInDev = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(path, content) {
        var then;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return (0, _fsExtra.outputFile)(path, content, 'utf8');

                    case 2:
                        then = Date.now() / 1000 - 10;
                        _context.next = 5;
                        return (0, _fsExtra.utimes)(path, then, then);

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function writeFileInDev(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

exports.webpackCompile = webpackCompile;
exports.enableHotReload = enableHotReload;

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _fsExtra = require('fs-extra');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function webpackCompile(config) {
    return new _promise2.default(function (resolve, reject) {
        (0, _webpack2.default)(config, function (err, stats) {
            if (err) {
                console.error(err.stack || err);
                if (err.details) {
                    console.error(err.details);
                }
                reject(err);
                return;
            }

            var info = stats.toJson();

            if (stats.hasErrors()) {
                console.error(info.errors);
                reject(info.errors);
                return;
            }

            if (stats.hasWarnings()) {
                console.warn(info.warnings);
            }

            resolve();
        });
    });
}

function enableHotReload(config) {
    var entry = config.entry,
        _config$name = config.name,
        name = _config$name === undefined ? 'client' : _config$name;


    (0, _keys2.default)(entry).forEach(function (entryName) {
        var currentEntry = entry[entryName];
        if (Array.isArray(currentEntry)) {
            entry[entryName] = [].concat((0, _toConsumableArray3.default)(currentEntry), ['webpack-hot-middleware/client?name=' + name + '&noInfo=true&reload=true']);
        }
    });
    config.plugins.push(new _webpack2.default.HotModuleReplacementPlugin(), new _webpack2.default.NoEmitOnErrorsPlugin());
}