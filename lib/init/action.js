/**
 * @file 脚手架
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const inquirer = require('inquirer');
const shelljs = require('shelljs');
const lavasScaffold = require('lavas-scaffold');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');

const formQ = require('./formQuestion');
const log = require('../log');
const utils = require('../utils');

let cwd = process.cwd();

/**
 * 导出工程
 *
 * @param  {Object} params 导出工程所需的参数
 * @return {Promise}       导出完成后的 promise
 */
async function exportProject(params) {
    let spinner = ora('正在导出工程..');

    spinner.start();
    await lavasScaffold.exportProject(params);
    spinner.stop();
    console.log('');
    log.info(''
        + '项目已创建成功，您可以操作如下命令开始开发 Lavas 工程：\n\n'
        + log.chalk.green('cd ' + params.name + '\n'
        + 'npm install'
    ));
}

/**
 * 初始化 pwa 项目入口
 *
 * @param {Object} conf 初始化配置
 */
module.exports = async function (conf) {
    let isNetworkOk = await utils.isNetworkConnect();

    if (!isNetworkOk) {
        log.info('创建工程需要下载云端模版')
        log.info('请确认您的设备处于网络可访问的环境中');
        return;
    }

    if (!shelljs.which('git')) {
        log.info('Lavas 命令行依赖 git 工具')
        log.info('当前环境下没有检测到 git 命令，请确认是否安装 git');
        return;
    }

    log.info(`欢迎使用 ${log.chalk.green('Lavas')} 解决方案`);
    log.info('开始新建一个 PWA 项目\n');

    let spinner = ora('正在拉取云端数据，请稍候...');

    spinner.start();
    let schema = await lavasScaffold.getSchema();
    spinner.stop();

    let params = await formQ(schema);
    let projectTargetPath = path.resolve(params.dirPath || cwd, params.name);

    if (fs.existsSync(projectTargetPath)) {
        if (conf.force) {

            // 直接覆盖当前项目
            fs.removeSync(projectTargetPath);
            await exportProject(params);
        }
        else {
            let ret = await inquirer.prompt([{
                'type': 'confirm',
                'message': '存在同名项目，是否覆盖?',
                'default': false,
                'name': 'isForce'
            }]);

            if (ret.isForce) {
                fs.removeSync(projectTargetPath);
                await exportProject(params);
            }
        }
    }
    else {
        await exportProject(params);
    }
};
