/**
 * @file 脚手架
 * @author mj(zoumiaojiang@gmail.com)
 */

import log from '../log';
import inquirer from 'inquirer';
import lavasScaffold from 'lavas-scaffold';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import formQ from './formQuestion';
import shelljs from 'shelljs';


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

    /* eslint-disable no-console */
    console.log('');
    /* eslint-enable no-console */
    log.info(''
        + '项目创建已成功，您可以操作如下命令开始开发工程：\n\n'
        + log.chalk.green('cd ' + path.resolve(params.dirPath, params.name) + '\n'
        + 'npm install'
    ));
}



/**
 * 初始化 pwa 项目入口
 *
 * @param {Object} conf 初始化配置
 */
export default (async function (conf) {

    log.info(`欢迎使用 ${log.chalk.green('Lavas')} 解决方案`);
    log.info('新建一个 PWA 项目\n');

    if (shelljs.which('git')) {

        let schema = await lavasScaffold.getSchema();
        let params = await formQ(schema);

        let projectTargetPath = path.resolve(params.dirPath, params.name);

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
    }
    else {
        log.info('当前环境下没有检测到 git 命令，请确认是否安装 git');
    }
});

