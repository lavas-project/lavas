/**
 * @file 安装扩展
 * @author wangyisheng@baidu.com (wangyisheng)
 */

const ora = require('ora');
const shelljs = require('shelljs');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const config = require('./config');
const utils = require('../utils');
const log = require('../utils/log');

function resolve(dir = '') {
    return path.resolve(process.cwd(), dir);
}

module.exports = async function (options) {
    let extensionName = options.name;
    let extension = config.EXTENSION_MAP[extensionName];
    if (!extension) {
        log.fatal(`没有找到名为 ${extensionName} 的 Lavas 扩展`);
        return;
    }
    let {npmName, dirName} = extension;

    // 这里检查是否重复安装
    // 1. 检查extensions目录下是否已有目标文件夹
    // 2. 检查config/extensions.js是否包含对应插件

    let isExtensionsDirExist = await fs.pathExists(resolve(`extensions/${dirName}`));
    let matchExtensionConfig = require(resolve('config/extensions')).find(config => config.name === extensionName);

    if (isExtensionsDirExist || matchExtensionConfig) {
        log.info(`检测到 Lavas 扩展：${extensionName} 已经安装过了，安装完毕`);
        return;
    }

    let isNetworkConnect = await utils.isNetworkConnect();
    if (!isNetworkConnect) {
        log.info('创建工程需要下载云端模版');
        log.info('请确认您的设备处于网络可访问的环境中');
        return;
    }

    let spinner = ora('正在安装扩展...');
    spinner.start();

    // npm install package
    console.log('\n');
    let code = shelljs.exec(`npm install ${npmName} --save`).code;
    if (code !== 0) {
        log.fatal(`npm install ${npmName} 失败`);
        return;
    }

    // 获取手动修改文件列表，之后提示使用
    let jsonObject
        = await fs.readJson(resolve(`node_modules/${npmName}/extensions/${dirName}/recommend.json`));
    let recommendFiles = jsonObject.list;

    await Promise.all([
        fs.copy(resolve(`node_modules/${npmName}/extensions`), resolve('extensions')),
        fs.copy(resolve(`node_modules/${npmName}/recommend`), resolve())
    ]);

    spinner.stop();

    log.info('安装扩展完毕');
    log.info('为了正确使用扩展，您还需要手动修改下列文件以增加对扩展的引用：');
    recommendFiles.forEach(file => {
        log.info(`* ${file}`);
    });
    console.log();
    log.info('请注意：标记为 lavas-extension-start/lavas-extension-end 之间的内容为需要修改的内容，'
        + '修改完毕后 recommend 文件可以删除');
};
