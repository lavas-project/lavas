/**
 * @file middleware
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

// 中间件的配置，需要支持路径（middlewares文件夹内路径）
module.exports = {

    /**
     * server middleware
     *
     * examples:
     *   'a'
     *   '{path}/a'
     *
     * @type {Array.<string>}
     */
    server: [],

    /**
     * client middleware
     *
     * @type {Array.<string>}
     */
    client: []

};
