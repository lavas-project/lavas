/**
 * @file ssr server start 逻辑
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const exec = require('mz/child_process').exec;

/**
 * 处理 ssr server 逻辑
 *
 * @param {Object} options action 的参数
 */
module.exports = async function (options) {

    // @TODO: 暂时先占个坑，等模板完善后精细完成
    exec('npm run start');
};
