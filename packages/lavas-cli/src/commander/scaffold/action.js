/**
 * @file lavas init scaffold action
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const inquirer = require('inquirer');
const shelljs = require('shelljs');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');

const formQ = require('./formQuestion');
const log = require('../../lib/utils/log');
const lavasScaffold = require('../../lib/scaffold');
const utils = require('../../lib/utils');
const locals = require('../../locals')();

let cwd = process.cwd();

/**
 * export lavas project
 *
 * @param  {Object} params params for export action
 * @param  {Object} templateConf  the config content of project
 */
async function exportProject(params, templateConf) {
    let spinner = ora(locals.LOADING_EXPORT_PROJECT + '...');

    spinner.start();
    await lavasScaffold.render(params, templateConf);
    spinner.stop();

    // for log beautify
    console.log('');
    log.info(locals.INIT_SUCCESS);
    log.info(locals.INIT_NEXT_GUIDE + '：\n\n'
        + log.chalk.green('cd ' + params.name + '\n'
        + 'npm install\n'
        + 'lavas dev'
    ));
    try {
        await axios('https://lavas.baidu.com/api/logger/send?action=cli&commander=init');
    }
    catch (e) {}
}

/**
 * the entry of init pwa project
 *
 * @param {Object} conf  init config object
 */
module.exports = async function (conf) {
    let isNetworkOk = await utils.isNetworkConnect();

    if (!isNetworkOk) {
        log.info(locals.NETWORK_DISCONNECT);
        log.info(locals.NETWORK_DISCONNECT_SUG);
        return;
    }

    log.info(locals.WELECOME);
    log.info(locals.GREETING_GUIDE + '\n');

    // 6 steps for init process

    // 第一步：从云端配置获取 Meta 配置，确定将要下载的框架和模板 List
    let spinner = ora(locals.LOADING_FROM_CLOUD + '...');
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

    let isPathExist = await fs.pathExists(projectTargetPath);
    if (isPathExist) {
        if (conf.force) {

            // cover the old project in force
            await fs.remove(projectTargetPath);
            await exportProject(params, templateConf);
        }
        else {
            let ret = await inquirer.prompt([{
                'type': 'confirm',
                'message': locals.SAMA_NAME_ENSURE + '?',
                'default': false,
                'name': 'isForce'
            }]);

            if (ret.isForce) {
                await fs.remove(projectTargetPath);
                await exportProject(params, templateConf);
            }
        }
    }
    else {
        await exportProject(params, templateConf);
    }
};
