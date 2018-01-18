/**
 * @file lavas config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const BUILD_PATH = path.resolve(__dirname, 'dist');

module.exports = {
    middleware: {
        server: [],
        client: [],
        all: []
    },
    build: {
        ssr: true,
        publicPath: '/lavas2/',
        path: BUILD_PATH
    },
    router: {
        mode: 'history',
        base: '/lavas2/',
        pageTransition: {
            type: 'fade',
            transitionClass: 'fade'
        }
    },
    serviceWorker: {
        swSrc: path.join(__dirname, 'core/service-worker.js'),
        swDest: path.join(BUILD_PATH, 'service-worker.js'),
        globDirectory: BUILD_PATH,
        globPatterns: [
            '**/*.{html,js,css,eot,svg,ttf,woff}'
        ],
        globIgnores: [
            'sw-register.js',
            '**/*.map'
        ],
        dontCacheBustUrlsMatching: /\.\w{8}\./
    }
};
