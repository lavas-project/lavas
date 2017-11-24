"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

exports.default = function (core) {
    var _this = this;

    var errConfig = core.config.errorHandler;

    errConfig.statusCode = errConfig.statusCode || [];

    var errPaths = new _set2.default([errConfig.target]);

    (0, _keys2.default)(errConfig.statusCode).forEach(function (key) {
        errPaths.add(errConfig.statusCode[key].target);
    });

    return function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(err, req, res, next) {
            var target;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!(err == null)) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt("return");

                        case 2:
                            if (!errPaths.has(req.url)) {
                                _context.next = 5;
                                break;
                            }

                            res.end();
                            return _context.abrupt("return");

                        case 5:

                            if (err.status !== 404) {
                                console.error(err);
                            }

                            target = errConfig.target;

                            if (errConfig.statusCode[err.status]) {
                                target = errConfig.statusCode[err.status].target;
                            }

                            res.writeHead(301, { Location: target });
                            res.end();

                        case 10:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function (_x, _x2, _x3, _x4) {
            return _ref.apply(this, arguments);
        };
    }();
};

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports["default"];