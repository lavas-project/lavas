/**
 * @file 构建逻辑
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const LavasCore = require('../../core');

const utils = require('../../lib/utils');
const log = require('../../lib/utils/log');

/**
 * 处理 build 构建逻辑
 *
 * @param {Object} options action 的参数
 */
module.exports = async function () {
    let rootDir = utils.getLavasProjectRoot();
    let core = new LavasCore(rootDir);

    log.info('开始构建...');
    await core.init(process.env.NODE_ENV || 'production', true);
    await core.build();
};
