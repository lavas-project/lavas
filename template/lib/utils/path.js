'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.distLavasPath = distLavasPath;
exports.assetsPath = assetsPath;
exports.resolveAliasPath = resolveAliasPath;

var _path = require('path');

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function distLavasPath(rootDir, path) {
  return (0, _path.join)(rootDir, _constants.LAVAS_DIRNAME_IN_DIST, path);
}

function assetsPath(path) {
  return _path.posix.join(_constants.ASSETS_DIRNAME_IN_DIST, path);
}

function resolveAliasPath(alias, path) {
  var matchedAliasKey = (0, _keys2.default)(alias).find(function (aliasKey) {
    return path.startsWith(aliasKey);
  });
  return matchedAliasKey ? (0, _path.join)(alias[matchedAliasKey], path.substring(matchedAliasKey.length)) : path;
}