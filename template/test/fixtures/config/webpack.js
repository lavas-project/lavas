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
            publicPath: '',

            /**
             * filename format
             *
             * @type {string}
             */
            filename: 'js/[name].[chunkhash:8].js'
        }
    },

    client: {
        entry: {
            app: ['./core/entry-client.js']
        }
    },

    server: {
        entry: './core/entry-server.js'
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
        ssr: true
    }

};
