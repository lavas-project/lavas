'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.routes2Reg = routes2Reg;
exports.matchUrl = matchUrl;
exports.generateRoutes = generateRoutes;

var _path = require('path');

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function routes2Reg(routes) {
    var reg = void 0;
    if (typeof routes === 'string') {
        reg = new RegExp('^' + routes.replace(/\/:[^\/]*/g, '/[^\/]+') + '\/?');
    } else if (routes instanceof RegExp) {
        return routes;
    }

    return reg;
}

function matchUrl(routes, url) {
    if (Array.isArray(routes)) {
        return routes.some(function (route) {
            return matchUrl(route, url);
        });
    }

    var reg = void 0;
    if (typeof routes === 'string') {
        reg = new RegExp('^' + routes.replace(/\/:[^\/]*/g, '/[^\/]+') + '\/?');
    } else if ((typeof routes === 'undefined' ? 'undefined' : (0, _typeof3.default)(routes)) === 'object' && typeof routes.test === 'function') {
        reg = routes;
    }

    return reg.test(url);
}

function generateRoutes(baseDir, options) {
    return getDirs(baseDir, '.vue', options).then(function (dirs) {
        var tree = mapDirsInfo(dirs, baseDir).reduce(function (tree, info) {
            return appendToTree(tree, info.level, info);
        }, []);
        return treeToRouter(tree[0].children, { dir: baseDir });
    });
}

function getDirs(baseDir) {
    var ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var options = arguments[2];

    return new _promise2.default(function (res, reject) {
        (0, _glob2.default)((0, _path.resolve)(baseDir, '**/*' + ext), options, function (err, dirs) {
            if (err) {
                reject(err);
            } else {
                var set = dirs.reduce(function (set, dir) {
                    return set.add(dir).add((0, _path.dirname)(dir));
                }, new _set2.default());
                res((0, _from2.default)(set));
            }
        });
    });
}

function mapDirsInfo(dirs, baseDir) {
    var baseFolder = (0, _path.basename)(baseDir);

    return dirs.map(function (dir) {
        var info = {
            dir: dir,
            level: generateDirLevel(dir, { baseDir: baseDir, baseFolder: baseFolder }),
            type: isFolder(dir, dirs) ? 'folder' : 'file'
        };

        if (info.type === 'folder' && dirs.indexOf(dir + '.vue') > -1) {
            info.nested = true;
        }

        return info;
    }).filter(function (_ref) {
        var type = _ref.type,
            dir = _ref.dir;

        if (type === 'folder') {
            return true;
        }

        if (dir.slice(-4) === '.vue' && dirs.indexOf(dir.slice(0, -4)) === -1) {
            return true;
        }

        return false;
    }).sort(function (a, b) {
        return a.level.length - b.level.length;
    });
}

function generateDirLevel(dir, _ref2) {
    var baseDir = _ref2.baseDir,
        _ref2$baseFolder = _ref2.baseFolder,
        baseFolder = _ref2$baseFolder === undefined ? (0, _path.basename)(baseDir) : _ref2$baseFolder;

    return [baseFolder].concat(dir.slice(baseDir.length).split('/')).filter(function (str) {
        return str !== '';
    });
}

function isFolder(dir, dirs) {
    dir = dir.replace(/\/$/, '') + '/';
    return dirs.some(function (fileDir) {
        return fileDir.indexOf(dir) === 0;
    });
}

function appendToTree(tree, levels, info) {
    var levelLen = levels.length;
    var node = tree;

    for (var i = 0; i < levelLen; i++) {
        var nodeLen = node.length;
        var j = void 0;

        for (j = 0; j < nodeLen; j++) {
            if (node[j].name === levels[i]) {
                if (i === levelLen - 1) {
                    node[j].info = info;
                } else {
                    node[j].children = node[j].children || [];
                    node = node[j].children;
                }

                break;
            }
        }

        if (j === nodeLen) {
            if (i === levelLen - 1) {
                node.push({
                    name: levels[i],
                    info: info
                });
            } else {
                node.push({
                    name: levels[i],
                    children: []
                });
                node = node[j].children;
            }
        }
    }

    return tree;
}

function treeToRouter(tree, parent) {
    return tree.reduce(function (router, _ref3) {
        var info = _ref3.info,
            children = _ref3.children;

        if (info.type === 'folder' && !info.nested) {
            return router.concat(treeToRouter(children, parent));
        }

        var route = {
            path: info.dir.slice(parent.dir.length).replace(/_/g, ':').replace(/(\/?index)?\.vue$/, ''),
            component: info.level.join('/')
        };

        if (parent.nested) {
            route.path = route.path.replace(/^\//, '');
        } else if (route.path === '') {
            route.path = '/';
        }

        if (children) {
            route.component += '.vue';
            route.children = treeToRouter(children, info);
        }
        route.name = info.level.slice(1).join('-').replace(/_/g, '').replace(/(-index)?\.vue$/, '');

        router.push(route);
        return router;
    }, []);
}