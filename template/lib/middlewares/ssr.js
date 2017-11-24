'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var getStaticHtml = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(cwd, entryName) {
        var entry;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        entry = STATIC_HTML_CACHE.get(entryName);

                        if (entry) {
                            _context.next = 6;
                            break;
                        }

                        _context.next = 4;
                        return (0, _fsExtra.readFile)((0, _path.join)(cwd, entryName + '.html'), 'utf8');

                    case 4:
                        entry = _context.sent;

                        STATIC_HTML_CACHE.set(entryName, entry);

                    case 6:
                        return _context.abrupt('return', entry);

                    case 7:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getStaticHtml(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

exports.default = function (core) {
    var cwd = core.cwd,
        config = core.config,
        isProd = core.isProd,
        renderer = core.renderer;

    return function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res, next) {
            var url, matchedEntry, needSSR, entryName, matchedRenderer, ctx;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            url = req.url;
                            matchedEntry = config.entry.find(function (entryConfig) {
                                return (0, _router.matchUrl)(entryConfig.routes, url);
                            });
                            needSSR = matchedEntry.ssr, entryName = matchedEntry.name;

                            if (!(isProd && !needSSR)) {
                                _context2.next = 12;
                                break;
                            }

                            console.log('[Lavas] route middleware: static ' + url);
                            _context2.t0 = res;
                            _context2.next = 8;
                            return getStaticHtml(cwd, entryName);

                        case 8:
                            _context2.t1 = _context2.sent;

                            _context2.t0.end.call(_context2.t0, _context2.t1);

                            _context2.next = 18;
                            break;

                        case 12:
                            console.log('[Lavas] route middleware: ssr ' + url);
                            _context2.next = 15;
                            return renderer.getRenderer(entryName);

                        case 15:
                            matchedRenderer = _context2.sent;
                            ctx = {
                                title: 'Lavas',
                                url: url,
                                entryName: entryName,
                                config: config,
                                req: req,
                                res: res,
                                error: function error(err) {
                                    return next(err);
                                }
                            };

                            matchedRenderer.renderToString(ctx, function (err, html) {
                                if (err) {
                                    return next(err);
                                }
                                res.end(html);
                            });

                        case 18:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        return function (_x3, _x4, _x5) {
            return _ref2.apply(this, arguments);
        };
    }();
};

var _fsExtra = require('fs-extra');

var _path = require('path');

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _router = require('../utils/router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STATIC_HTML_CACHE = (0, _lruCache2.default)({
    max: 1000,
    maxAge: 1000 * 60 * 15
});

module.exports = exports['default'];