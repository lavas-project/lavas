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
        ssr: false,
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
        enable: true,
        swSrc: path.join(__dirname, 'core/service-worker.js'),
        swDest: path.join(BUILD_PATH, 'service-worker.js')
    }
};
