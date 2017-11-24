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
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
            var target;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            _context.next = 3;
                            return next();

                        case 3:
                            _context.next = 21;
                            break;

                        case 5:
                            _context.prev = 5;
                            _context.t0 = _context["catch"](0);

                            if (!(_context.t0 == null)) {
                                _context.next = 9;
                                break;
                            }

                            return _context.abrupt("return");

                        case 9:
                            if (!(ctx.headerSent || !ctx.writable)) {
                                _context.next = 12;
                                break;
                            }

                            _context.t0.headerSent = true;
                            return _context.abrupt("return");

                        case 12:
                            if (!errPaths.has(ctx.path)) {
                                _context.next = 15;
                                break;
                            }

                            ctx.res.end();
                            return _context.abrupt("return");

                        case 15:

                            if (_context.t0.status !== 404) {
                                console.error(_context.t0);
                            }

                            ctx.res._headers = {};

                            target = errConfig.target;

                            if (errConfig.statusCode[_context.t0.status]) {
                                target = errConfig.statusCode[_context.t0.status].target;
                            }

                            ctx.redirect(target);
                            ctx.res.end();

                        case 21:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[0, 5]]);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();
};

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports["default"];