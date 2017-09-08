/**
 * @file 构建逻辑
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const LavasCore = require('lavas-core');

const utils = require('../utils');
const log = require('../utils/log');

/**
 * 处理 build 构建逻辑
 *
 * @param {Object} options action 的参数
 */
module.exports = async function () {
    let rootDir = utils.getLavasProjectRoot();
    let core = new LavasCore(rootDir);

    log.info('开始构建...');
    await core.build('production');
    log.info('构建完成...');
};
