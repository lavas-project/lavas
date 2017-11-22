/**
 * @file build config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');

module.exports = {

    /**
     * build output path
     *
     * @type {string}
     */
    path: path.resolve(__dirname, '../dist'),

    /**
     * public path
     *
     * @type {string}
     */
    publicPath: '/',

    /**
     * if extract css files
     *
     * @type {boolean}
     */
    cssExtract: true,

    /**
     * if enable minification
     *
     * @type {boolean}
     */
    cssMinimize: true,

    /**
     * if generate css source map or not
     *
     * @type {boolean}
     */
    cssSourceMap: true,

    /**
     * if generate js source map or not
     *
     * @type {boolean}
     */
    jsSourceMap: true,

    /**
     * if need analyzer, https://github.com/th0r/webpack-bundle-analyzer
     * default false, if this variable is an Object, then analyzer will be opened
     *
     * @type {boolean|Object}
     */
    bundleAnalyzerReport: false,

    /**
     * webpack.DefinePlugin
     *
     * @type {Object.<string, Object>}
     */
    defines: {
        base: {},
        client: {},
        server: {}
    },

    /**
     * alias for webpack
     *
     * @type {Object.<string, Object>}
     */
    alias: {
        base: {},
        client: {},
        server: {}
    },

    /**
     * webpack plugins
     *
     * @type {Object.<string, Array.<*>>}
     */
    plugins: {
        base: [],
        client: [],
        server: []
    },

    /**
     * node externals
     *
     * @type {Array.<string|RegExp>}
     */
    nodeExternalsWhitelist: [],

    /**
     * in development mode, we can watch some paths to files, dirs or glob patterns,
     * rebuild when these files changed
     *
     * @type {string|Array.<string>}
     */
    watch: null,

    /**
     * extend function to modify webpack config, the config in function parameters is webpack config
     *
     * example:
     *
     * ```javascript
     * function extend(config, {isClient}) {
     * }
     * ```
     *
     * @type {Function}
     */
    extend: null,

    /**
     * files need to be copied after build when ssr entry exists
     *
     * each element contains following properties:
     * @param {string} path *required* file or directory path
     * @param {Array<string>} ignore *NOT required* files or patterns need to be ignored
     *
     * @type {Array}
     */
    ssrCopy: []
};
