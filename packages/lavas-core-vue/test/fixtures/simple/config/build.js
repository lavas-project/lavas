/**
 * @file build config
 * @author zoumiaojiang(zoumiaojiang@gmail.com)
 */

/* eslint-disable */
'use strict';

const path = require('path');

module.exports = {

    ssr: false,

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
    publicPath: '/from-dir/',

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
     * alias for webpack
     *
     * @type {Object.<string, string>}
     */
    alias: {
        server: {
            'iscroll/build/iscroll$': path.join(__dirname, '../entries/main/iscroll-ssr.js')
        }
    },

    /**
     * webpack plugins
     *
     * @type {Object.<string, string>}
     */
    plugins: {},

    /**
     * node externals
     *
     * @type {Array.<string|RegExp>}
     */
    nodeExternalsWhitelist: [/iscroll/],

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
    extend: function (config, {type}) {
        if (type === 'base') {
            let vueRule = config.module.rules[0];
            vueRule.use.push({
                loader: 'vue-style-variables-loader',
                options: {
                    importStatements: [
                        '@import "~@/assets/style/variable.styl";'
                    ]
                }
            });
        }
    },

    /**
     * files need to be copied after build
     *
     * each element contains following properties:
     * @param {string} path *required* file or directory path
     * @param {Array<string>} ignore *NOT required* files or patterns need to be ignored
     *
     * @type {Array}
     */
    ssrCopy: []
};
