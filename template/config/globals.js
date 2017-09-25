/**
 * @file globals config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

const path = require('path');

module.exports = {

    /**
     * 项目根目录
     *
     * @type {string}
     */
    rootDir: path.join(__dirname, '..'),

    /**
     * 中间件的目录
     *
     * @type {string}
     */
    middlewareDir: path.join(__dirname, '../middlewares')

};
