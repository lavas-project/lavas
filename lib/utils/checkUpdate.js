/**
 * @file 检测新版本
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const semver = require('semver');
const axios = require('axios');
const log = require('./log');
const getHome = require('./index').getHome;
const fs = require('fs-extra');
const path = require('path');
const locals = require('../../locals')();

const LAVAS_NPM_REGISTRY = 'https://registry.npm.taobao.org/lavas';
const TIME_RANGE = 24 * 60 * 60 * 1000;

async function requestPackageInfo() {
    try {
        let packageInfo = await axios({
            url: LAVAS_NPM_REGISTRY,
            timeout: 1000
        });
        let lastVersion = packageInfo.data['dist-tags'].latest;
        let curVersion = require('../../../package.json').version;

        if (semver.gt(lastVersion, curVersion)) {
            log.info(log.chalk.bold.yellow(locals.UPDATE_TIPS));
        }
    }
    catch (e) {}
}

/**
 * 检测是否需要更新 Lavas 版本
 */
module.exports = async function () {
    let updateCheckerInfoPath = path.resolve(getHome(), '.updateChecker.txt');
    if (fs.existsSync(updateCheckerInfoPath)) {
        let updateCheckerInfo = fs.readFileSync(updateCheckerInfoPath, 'utf-8');
        if (Date.now() - (+updateCheckerInfo) >= TIME_RANGE) {
            await requestPackageInfo();
        }
    }
    else {
        let dirname = path.dirname(updateCheckerInfoPath);
        fs.existsSync(dirname) && fs.mkdirpSync(dirname);
        fs.writeFileSync(updateCheckerInfoPath, Date.now() + '');
        await requestPackageInfo();
    }
};
