/**
 * @file dev server
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const exec = require('mz/child_process').exec;

/**
 * 处理 dev server 逻辑
 *
 * @param {Object} options action 的参数
 */
module.exports = async function () {

    // @TODO: 暂时先占个坑，等模板完善后精细完成
    exec('npm run dev');
};
