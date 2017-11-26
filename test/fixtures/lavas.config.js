/**
 * @file lavas config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const BUILD_PATH = path.resolve(__dirname, 'dist');

module.exports = {
    build: {
        path: BUILD_PATH
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
    manifest: {
        start_url: '/?utm_source=homescreen',
        name: 'lavas-test',
        short_name: 'lavas-test',
        icons: [
            {
                src: 'static/img/icons/android-chrome-192x192.png',
                type: 'image/png',
                size: '192x192'
            }
        ],
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#278fef'
    },
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
