/**
 * @file webpack config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const globals = require('./globals');

module.exports = {

    base: {
        output: {

            /**
             * output dir
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
             * filename format
             *
             * @type {string}
             */
            filename: 'js/[name].[chunkhash:8].js'
        }
    },

    shortcuts: {
        /**
         * assets directory name
         *
         * @type {string}
         */
        assetsDir: 'static',

        /**
         * copy directory name
         *
         * @type {string}
         */
        copyDir: path.resolve(globals.rootDir, 'static'),

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
         * if need ssr
         *
         * @type {boolean}
         */
        ssr: true,

        /**
         * if need analyzer, https://github.com/th0r/webpack-bundle-analyzer
         * default false, if this variable is an Object, then analyzer will be opened
         *
         * @type {boolean|Object}
         */
        bundleAnalyzerReport: false
    },

    /**
     * extend webpack config
     *
     * @type {Function|null}
     */
    extend: null
};
