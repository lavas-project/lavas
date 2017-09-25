'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ManifestJson = function () {
    function ManifestJson(opts) {
        (0, _classCallCheck3.default)(this, ManifestJson);

        this.config = opts.config;
        this.path = opts.path;
    }

    (0, _createClass3.default)(ManifestJson, [{
        key: 'apply',
        value: function apply(compiler) {
            var _this = this;

            var config = this.config;

            if (config && config.icons && config.icons.length > 0) {
                config.icons.forEach(function (item, index) {
                    config.icons[index].src = item.src + '?v=' + Date.now();
                });
            }

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
        }
    }]);
    return ManifestJson;
}();

exports.default = ManifestJson;
module.exports = exports['default'];