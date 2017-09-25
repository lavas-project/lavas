/**
 * @file errorHandler config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    target: '/500',

    statusCode: {
        404: {
            target: '/404'
        },
        500: {
            target: '/500'
        }
    }

};
