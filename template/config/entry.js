/**
 * @file webpack config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

module.exports = [
    {
        name: 'detail',
        /**
         * 是否启用 ssr，决定上面那些属性会有效
         *
         */
        ssr: true,
        /**
         * 这个模块匹配的路径，default 的优先级最低
         *
         * @type {RegExp|string|Array.<RegExp|string>}
         */
        routes: /^\/detail/,
        /**
         * 使用的模板文件名，默认为index.html.tmpl
         * @type {string}
         */
        templateFile: process.env.MODE === 'sf' ? 'index.sf.html.tmpl' : 'index.html.tmpl'
    },
    {
        name: 'main',
        ssr: true,
        routes: /^.*$/
    }
];
