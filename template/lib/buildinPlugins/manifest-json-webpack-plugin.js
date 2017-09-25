'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MANIFEST_ASSET_NAME = 'static/manifest.json';

function ManifestJson(opts) {
    this.config = opts.config;
    this.path = opts.path;
}

ManifestJson.prototype.apply = function (compiler) {
    var _this = this;

    var manifestContent = (0, _stringify2.default)(this.config);

    compiler.plugin('emit', function (compilation, callback) {
        compilation.assets[_this.path] = {
            source: function source() {
                return manifestContent;
            },
            size: function size() {
                return manifestContent.length;
            }
        };
        callback();
    });
};

module.exports = ManifestJson;