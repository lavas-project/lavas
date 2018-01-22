/**
 * @file development config
 * @author zoumiaojiang(zoumiaojiang@gmail.com)
 */

'use strict';

module.exports = {

    build: {
        cssExtract: true,
        ssrCopy: [
            {
                src: 'server.prod.js'
            },
            {
                src: 'package.json'
            }
        ]
    }

};
