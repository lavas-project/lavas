/**
 * @file webpack config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = [
    {
        /**
         * entry name
         *
         * @type {string}
         */
        name: 'detail',

        /**
         * enable ssr, or not
         *
         * @type {boolean}
         */
        ssr: true,

        /**
         * vue-router base url
         * https://router.vuejs.org/en/api/options.html#base
         *
         * @type {string}
         */
        base: '/',

        /**
         * the vue-router mode, the value must be history or hash.
         *
         * @type {string}
         */
        mode: 'history',

        /**
         * the RegExp of this entry's routes
         *
         * @type {RegExp|string|Array.<RegExp|string>}
         */
        routes: /^\/detail/,

        /**
         * 使用的模板文件名，默认为index.html.tmpl
         *
         * @type {string}
         */
        // templateFile: process.env.MODE === 'sf' ? 'index.sf.html.tmpl' : 'index.html.tmpl'
    },
    {
        name: 'main',
        ssr: true,
        mode: 'history',
        base: '/',
        routes: /^.*$/,
        pageTransition: {
            type: 'slide',
            slideLeftClass: 'slide-left',
            slideRightClass: 'slide-right',
            alwaysBackPages: ['index'],
            alwaysForwardPages: []

            // type: 'fade',
            // transitionClass: 'fade'

            // type: 'slide-fade'
        }
    }
];
