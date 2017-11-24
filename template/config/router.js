/**
 * @file router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = {

    // 自定义路由规则
    rewrite: [
        // {from: /^\/(detail.*)$/, to: '/rewrite/$1'},
        // {from: '/detail/:id', to: '/rewrite/detail/:id'}
    ],

    routes: [
        {
            pattern: '/detail/:id',
            // path: '/rewrite/detail/:id',
            meta: {
                keepAlive: true
            }
        }
    ]
};
