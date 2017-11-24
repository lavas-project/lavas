/**
 * @file development config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    build: {
        cssExtract: true,
        ssrCopy: [
            {
                src: 'lib'
            },
            {
                src: 'server.prod.js'
            },
            {
                src: 'node_modules'
            },
            {
                src: 'package.json'
            }
        ]
    }

};
