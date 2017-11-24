'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hash = require('hash-sum');
var uniq = require('lodash.uniq');

var isJS = function isJS(file) {
  return (/\.js(\?[^.]+)?$/.test(file)
  );
};

var VueSSRClientPlugin = function () {
  function VueSSRClientPlugin() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, VueSSRClientPlugin);

    this.options = (0, _assign2.default)({
      filename: 'vue-ssr-client-manifest.json'
    }, options);
  }

  (0, _createClass3.default)(VueSSRClientPlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('emit', function (compilation, cb) {
        var stats = compilation.getStats().toJson();

        (0, _keys2.default)(stats.entrypoints).forEach(function (entryName) {

          var allFiles = uniq(stats.assets.map(function (a) {
            return a.name;
          }));

          var initialFiles = uniq(stats.entrypoints[entryName].assets.filter(isJS));

          var asyncFiles = allFiles.filter(isJS).filter(function (file) {
            return initialFiles.indexOf(file) < 0;
          });

          var manifest = {
            publicPath: stats.publicPath,
            all: allFiles,
            initial: initialFiles,
            async: asyncFiles,
            modules: {}
          };

          var assetModules = stats.modules.filter(function (m) {
            return m.assets.length;
          });
          var fileToIndex = function fileToIndex(file) {
            return manifest.all.indexOf(file);
          };
          stats.modules.forEach(function (m) {
            if (m.chunks.length === 1) {
              var cid = m.chunks[0];
              var chunk = stats.chunks.find(function (c) {
                return c.id === cid;
              });
              if (!chunk || !chunk.files) {
                return;
              }
              var files = manifest.modules[hash(m.identifier)] = chunk.files.map(fileToIndex);

              assetModules.forEach(function (m) {
                if (m.chunks.some(function (id) {
                  return id === cid;
                })) {
                  files.push.apply(files, m.assets.map(fileToIndex));
                }
              });
            }
          });

          var json = (0, _stringify2.default)(manifest, null, 2);

          var manifestPath = _this.options.filename.replace('[entryName]', entryName);

          compilation.assets[manifestPath] = {
            source: function source() {
              return json;
            },
            size: function size() {
              return json.length;
            }
          };
        });

        cb();
      });
    }
  }]);
  return VueSSRClientPlugin;
}();

exports.default = VueSSRClientPlugin;
module.exports = exports['default'];