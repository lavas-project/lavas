/**
 * @file 脚手架
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const inquirer = require('inquirer');
const shelljs = require('shelljs');
const lavasScaffold = require('../../../lavas-scaffold/dist');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');

const formQ = require('./formQuestion');
const log = require('../utils/log');
const utils = require('../utils');

let cwd = process.cwd();

/**
 * 导出工程
 *
 * @param  {Object} params 导出工程所需的参数
 * @param  {Object} templateConf 导出的工程的配置信息
 */
async function exportProject(params, templateConf) {
    let spinner = ora('正在导出工程..');

    spinner.start();
    await lavasScaffold.render(params, templateConf);
    spinner.stop();

    // 为了打印出的内容美观不紧凑
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
        log.info('创建工程需要下载云端模版');
        log.info('请确认您的设备处于网络可访问的环境中');
        return;
    }

    if (!shelljs.which('git')) {
        log.info('Lavas 命令行依赖 git 工具');
        log.info('当前环境下没有检测到 git 命令，请确认是否安装 git');
        return;
    }

    log.info(`欢迎使用 ${log.chalk.green('Lavas')} 解决方案`);
    log.info('开始新建一个 Lavas PWA 项目\n');

    // 整个初始化过程分为 6 步

    // 第一步：从云端配置获取 Meta 配置，确定将要下载的框架和模板 List
    let spinner = ora('正在拉取云端数据，请稍候...');
    spinner.start();
    let metaSchema = await lavasScaffold.getMetaSchema();
    spinner.stop();

    // 第二步：等待用户选择将要下载的框架和模板
    let metaParams = await formQ(metaSchema);

    // 第三步：通过用户选择的框架和模板，下载模板
    spinner.start();
    let templateConf = await lavasScaffold.download(metaParams);
    spinner.stop();

    // 第四步：根据下载的模板的 meta.json 获取当前模板所需要用户输入的字段 schema
    let schema = await lavasScaffold.getSchema(templateConf);

    // 第五步：等待用户输入 schema 所预设的字段信息
    let params = await formQ(schema);

    // 第六步：渲染模板，并导出到指定的文件夹(当前文件夹)
    let projectTargetPath = path.resolve(params.dirPath || cwd, params.name);
    params = Object.assign({}, metaParams, params);

    if (fs.existsSync(projectTargetPath)) {
        if (conf.force) {

            // 直接覆盖当前项目
            fs.removeSync(projectTargetPath);
            await exportProject(params, templateConf);
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
                await exportProject(params, templateConf);
            }
        }
    }
    else {
        await exportProject(params, templateConf);
    }
};
