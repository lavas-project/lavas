/**
 * @file lavas config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');
const BUILD_PATH = path.resolve(__dirname, 'dist');

module.exports = {
    build: {
        ssr: true,
        path: BUILD_PATH
    },
    router: {
        mode: 'history',
        base: '/',
        pageTransition: {
            type: 'fade',
            transitionClass: 'fade'
        }
    },
    nodeExternalsWhitelist: [
        /vuetify/
    ],
    bundleAnalyzerReport: true,
    babel: {
        presets: ['vue-app'],
        plugins: [
            "transform-runtime",
            [
                "transform-imports",
                {
                    "vuetify": {
                        "transform": "vuetify/es5/components/${member}",
                        "preventFullImport": true
                    }
                }
            ]
        ],
        babelrc: false
    }
};
