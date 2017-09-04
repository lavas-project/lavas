/**
 * @file 编译逻辑
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const exec = require('mz/child_process').exec;

/**
 * 处理 build 构建 generate 逻辑
 *
 * @param {Object} options action 的参数
 */
module.exports = async function () {

    // @TODO: 暂时先占个坑，等模板完善后精细完成
    exec('npm run build');
};
