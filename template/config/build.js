/**
 * @file build config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');

module.exports = {

    /**
     * 编译之后的路径，默认为 dist
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
     * 是否需要 bundle 分析报告
     *
     * 默认是布尔类型，如果是 Object，择作为 analyzer 的参数
     *
     * @type {boolean|Object}
     */
    bundleAnalyzerReport: false,

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
     * alias for webpack
     *
     * @type {Object.<string, string>}
     */
    alias: {},

    /**
     * webpack plugins
     *
     * @type {Array.<*>}
     */
    plugins: [],

    /**
     * node externals 白名单
     *
     * @type {Array.<string|RegExp>}
     */
    nodeExternalsWhitelist: [],

    /**
     * 扩展 webpack 的配置
     *
     * ```javascript
     * function extend(config, {isClient}) {
     * }
     * ```
     *
     * 函数参数中的 config 是 webpack 的配置
     */
    extend: null
};
