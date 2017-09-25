'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.vueLoaders = vueLoaders;
exports.cssLoaders = cssLoaders;
exports.styleLoaders = styleLoaders;

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function vueLoaders() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return {
        loaders: cssLoaders({
            sourceMap: options.cssSourceMap,
            minimize: options.cssMinimize,
            extract: options.cssExtract
        })
    };
}

function cssLoaders() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    var cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: options.minimize,
            sourceMap: options.sourceMap
        }
    };

    function generateLoaders(loader, loaderOptions) {
        var loaders = [cssLoader];

        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: (0, _assign2.default)({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            });
        }

        if (options.extract) {
            return _extractTextWebpackPlugin2.default.extract({
                use: loaders,
                fallback: 'vue-style-loader'
            });
        }

        return ['vue-style-loader'].concat(loaders);
    }

    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', {
            indentedSyntax: true
        }),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    };
}

function styleLoaders(options) {
    var output = [];
    var loaders = cssLoaders(options);

    (0, _keys2.default)(loaders).forEach(function (extension) {
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loaders[extension]
        });
    });

    return output;
}