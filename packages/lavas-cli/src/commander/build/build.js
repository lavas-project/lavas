/**
 * @file 构建逻辑
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';
const path = require('path');
const fs = require('fs-extra');
const fork = require('child_process').fork;

const utils = require('../../lib/utils');
const log = require('../../lib/utils/log');
const locals = require('../../locals')();

async function getConfigPath(config) {
    if (!config) {
        return;
    }

    if (!path.isAbsolute(config)) {
        config = path.resolve(process.cwd(), config);
    }

    if (!(await fs.pathExists(config))) {
        log.warn(`${locals.START_NO_FILE} ${config}`);
        return;
    }

    return config;
}

/**
 * 处理 build 构建逻辑
 *
 * @param {string} config 用户指定的配置文件路径
 */
module.exports = async function (config) {
    log.info(locals.START_BUILD + '...');

    let rootDir = utils.getLavasProjectRoot();
    let buildScriptPath = path.resolve(rootDir, '.lavas/build.js');

    // 不存在.lavas/build.js 时创建 build.js，避免调用全局 lavas-core-vue
    if (!await fs.pathExists(buildScriptPath)) {
        await fs.copy(path.resolve(__dirname, '../../templates/build.js'), buildScriptPath);
    }

    let options = [];
    let configPath = await getConfigPath(config);
    if (configPath) {
        options.push(configPath);
    }

    fork(buildScriptPath, options);
};
