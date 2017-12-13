/**
 * @file lavas config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const BUILD_PATH = path.resolve(__dirname, 'dist');

module.exports = {
    middleware: {
        server: ['server-only'],
        client: ['client-only'],
        all: ['both']
    },
    build: {
        path: BUILD_PATH,
        defines: {
            base: {
                'DEFINE_TEST_VAR': '"test-var"'
            }
        }
    },
    entry: [
        {
            name: 'main',
            ssr: true,
            mode: 'history',
            base: '/',
            routes: /^.*$/,
            pageTransition: {
                type: 'fade',
                transitionClass: 'fade'
            }
        }
    ],
    serviceWorker: {
        swSrc: path.join(__dirname, 'core/service-worker.js'),
        swDest: path.join(BUILD_PATH, 'service-worker.js'),
        globDirectory: path.basename(BUILD_PATH),
        globPatterns: [
            '**/*.{html,js,css,eot,svg,ttf,woff}'
        ],
        globIgnores: [
            'sw-register.js',
            '**/*.map'
        ],
        appshellUrls: ['/appshell'],
        dontCacheBustUrlsMatching: /\.\w{8}\./
    }
};
