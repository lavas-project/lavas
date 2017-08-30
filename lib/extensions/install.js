/**
 * @file 安装扩展
 * @author wangyisheng@baidu.com (wangyisheng)
 */

const ora = require('ora');
const shelljs = require('shelljs');
const fs = require('fs-extra');
const path = require('path');

const config = require('./config');
const utils = require('../utils');
const log = require('../log');

function resolve(dir = '') {
    return path.resolve(process.cwd(), dir);
}

module.exports = async function (options) {
    let extensionName = options.name.toLowerCase();
    let isNetworkConnect = await utils.isNetworkConnect();

    if (!isNetworkConnect) {
        log.info('创建工程需要下载云端模版');
        log.info('请确认您的设备处于网络可访问的环境中');
        return;
    }

    let extension = config.EXTENSION_MAP[extensionName];
    if (!extension) {
        log.fatal(`没有找到名为 ${extensionName} 的 Lavas 扩展`);
        return;
    }

    let {npmName, dirName} = extension;
    let spinner = ora('正在安装扩展...');
    spinner.start();

    // npm install package
    console.log('\n');
    let code = shelljs.exec(`npm install ${npmName} --prefix lavas-temp`).code
    if (code !== 0) {
        log.fatal(`npm install ${npmName} 失败`);
        return;
    }

    let recommendFiles =
        require(resolve(`lavas-temp/node_modules/${npmName}/extensions/${dirName}/recommend.json`)).list;
    await Promise.all([
        fs.copy(resolve(`lavas-temp/node_modules/${npmName}/extensions`), resolve('extensions')),
        fs.copy(resolve(`lavas-temp/node_modules/${npmName}/recommend`), resolve())
    ]);
    await fs.remove(resolve('lavas-temp'));

    spinner.stop();

    log.info('安装扩展完毕');
    log.info('为了正确使用扩展，您还需要手动修改下列文件以增加对扩展的引用：')
    recommendFiles.forEach(file => {
        log.info(`* ${file}`);
    });
    console.log();
    log.info('请注意：标记为 lavas-extension-start/lavas-extension-end 之间的内容为需要修改的内容，'
        + '修改完毕后 recommend 文件可以删除');
}
