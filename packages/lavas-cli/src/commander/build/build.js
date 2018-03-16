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

    // 存在.lavas/build.js 直接调用，避免引用全局 lavas-core-vue
    if (!await fs.pathExists(buildScriptPath)) {
        await fs.copy(path.resolve(__dirname, '../../templates/build.js'), buildScriptPath);
    }

    let options = [];
    let configPath = await getConfigPath(config);
    if (configPath) {
        options.push(configPath);
    }

    fork(buildScriptPath, options);

    // 通过 package.json 中的配置将 lavas-core 从命令行解耦
    // 要求所有的 core 都提供相同的 API
    // let lavasConf = require(path.resolve(rootDir, 'package.json')).lavas || {};

    // let LavasCore = require(lavasConf.core || 'lavas-core-vue');
    // let core = new LavasCore(rootDir);

    // let configPath = await getConfigPath(config);

    // await core.init(process.env.NODE_ENV || 'production', true, {config: configPath});
    // await core.build();
};
