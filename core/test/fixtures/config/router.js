/**
 * @file router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    /**
     * route rewrite rules
     *
     * example:
     * ```javascript
     * [{from: '/from/detail/:id', to: '/to/detial/:id'}]
     * ```
     *
     * @type {Array.<Object>}
     */
    rewrite: [
        // {from: /^\/(detail.*)$/, to: '/rewrite/$1'},
        // {from: '/detail', to: '/rewrite'}
    ],

    routes: [
        {
            pattern: /\/detail/,
            // meta: {
            //     keepAlive: true
            // },
            // lazyLoading: true,
            // chunkname: 'detail'
        }
    ]
};
