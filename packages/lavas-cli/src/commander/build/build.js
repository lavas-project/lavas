/**
 * @file 构建逻辑
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';
const path = require('path');
const fs = require('fs-extra');

const utils = require('../../lib/utils');
const log = require('../../lib/utils/log');
const locals = require('../../locals')();

/**
 * 处理 build 构建逻辑
 *
 * @param {string} config 用户指定的配置文件路径
 */
module.exports = async function (config) {
    log.info(locals.START_BUILD + '...');

    let rootDir = utils.getLavasProjectRoot();

    // 通过 package.json 中的配置将 lavas-core 从命令行解耦
    // 要求所有的 core 都提供相同的 API
    let lavasConf = require(path.resolve(rootDir, 'package.json')).lavas || {};

    let LavasCore = require(lavasConf.core || 'lavas-core-vue');
    let core = new LavasCore(rootDir);

    if (config) {
        if (!path.isAbsolute(config)) {
            config = path.resolve(process.cwd(), config);
        }

        if (!(await fs.pathExists(config))) {
            log.warn(`${locals.START_NO_FILE} ${config}`);
            return;
        }
    }

    await core.init(process.env.NODE_ENV || 'production', true, {config});
    await core.build();
};
