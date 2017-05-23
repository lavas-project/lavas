/**
 * @file 脚手架
 * @author mj(zoumiaojiang@gmail.com)
 */

import log from '../log';
import inquirer from 'inquirer';
import childProcess from 'child_process';
import bpwa from 'bpwa';
import ora from 'ora';
import path from 'path';
import fs from 'fs';

const exec = childProcess.execSync;


/**
 * 获取当前用户的 git 账号信息
 *
 * @return {Promise} promise 对象
 */
function getGitInfo() {

    return new Promise((resolve, reject) => {
        let defaultAuthorName = '';
        let defaultEmail = '';
        try {
            // 尝试从 git 配置中获取
            defaultAuthorName = exec('git config --get user.name');
            defaultEmail = exec('git config --get user.email');
        }
        catch (e) {}
        defaultAuthorName = defaultAuthorName && defaultAuthorName.toString().trim();
        defaultEmail = defaultEmail && defaultEmail.toString().trim();
        resolve({defaultAuthorName, defaultEmail});
    });
}




/**
 * 解析 bpwa schema
 *
 * @param  {Object} schema schema object
 * @return {Object} 解析的结果对象
 */
const parseSchema = async function (schema) {
    let params = {};
    let keys = Object.keys(schema.properties);

    for (let i = 0, len = keys.length; i < len; i++) {
        let key = keys[i];
        let con = schema.properties[key];
        let type = con.type;
        let name = con.name || con.description;
        let opts = {};

        // 这里做一下 schema 到 question 所需参数的适配，实现对 bpwa schema 有一定要求
        // 必须包含 dirPath, name, email 等字段，其他字段可以自定义
        if (type === 'string' || type === 'number') {

            // 如果输入项是 author 或者 email 的，尝试的去 git config 中拿默认的内容
            if (key === 'author' || key === 'email') {
                let userInfo = await getGitInfo();
                con.default = (key === 'author') ? userInfo.defaultAuthorName : userInfo.defaultEmail;
            }
            if (key === 'dirPath') {
                con.default = process.cwd();
            }
            opts = {
                'type': 'input',
                'message': `请输入${name}: `,
                'default': con.default,
                'name': key,
                'validate': con.validate || function () {
                    return true;
                }
            };
        }
        else if (type === 'boolean') {
            opts = {
                'type': 'confirm',
                'message': `${name}? :`,
                'default': false,
                'name': key
            };
        }
        else if (type === 'list') {
            let srcList = [];
            let list = [];

            if (!con.dependence) {
                srcList = con.list;
            }
            else if (con.depLevel > 0) {
                srcList = schema.properties[con.dependence][con.ref];
            }

            srcList.forEach(item => list.push({
                'value': item.value,
                'name': item.value
                    + ((item.url || item.imgs || item.img)
                        ? ' [' + log.chalk.yellow.bold.underline(item.url || item.imgs[0].src || item.img) + ']'
                        : ''
                    ),
                'short': item.value
            }));

            opts = {
                'type': 'list',
                'message': `选择一个${name}: `,
                'choices': list,
                'default': list[0],
                'name': key
            };
        }

        let data = await inquirer.prompt([opts]);
        params = Object.assign(params, data);
    }

    return params;
};


async function exportProject(params) {
    let spinner = ora('正在导出工程..');
    spinner.start();
    await bpwa.exportProject(params);
    spinner.stop();
}


/**
 * 初始化 pwa 项目入口
 *
 * @param {Object} conf 初始化配置
 */
export default (async function (conf) {

    log.info(`欢迎使用 ${log.chalk.green('bpwa')} 解决方案`);
    log.info('新建一个 pwa 项目\n');

    let schema = await bpwa.getSchema();
    let params = await parseSchema(schema);

    let projectTargetPath = path.resolve(params.dirPath, params.name);

    if (fs.existsSync(projectTargetPath)) {
        if (conf.force) {
            // 直接覆盖当前项目
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
                await exportProject(params);
            }
        }
    }
    else {
        await exportProject(params);
    }

});

