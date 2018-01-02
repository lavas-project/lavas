/**
 * @file 检测新版本
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const semver = require('semver');
const axios = require('axios');
const log = require('./log');

const LAVAS_NPM_REGISTRY = 'https://registry.npm.taobao.org/lavas';
const UPDATE_TEXT = 'Lavas 有新的版本更新，为了不影响您的使用，请您通过 `npm update -g lavas` 命令更新版本 !';

/**
 * 检测是否需要更新 Lavas 版本
 */
module.exports = async function () {
    try {
        let packageInfo = await axios({
            url: LAVAS_NPM_REGISTRY,
            timeout: 1000
        });
        let lastVersion = packageInfo.data['dist-tags'].latest;
        let curVersion = require('../../../package.json').version;

        if (semver.gt(lastVersion, curVersion)) {
            console.log('\n');
            log.info(log.chalk.bold.yellow(UPDATE_TEXT));
            log.info('为了保证安装速度，我们建议使用 cnpm');
        }

    }
    catch (e) {
        // do nothing
    }
};
