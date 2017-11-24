/**
 * @file 卸载扩展
 * @author wangyisheng@baidu.com (wangyisheng)
 */

const ora = require('ora');
const fs = require('fs-extra');
const shelljs = require('shelljs');
const path = require('path');

const config = require('./config');
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
    let spinner = ora('正在卸载扩展...');
    spinner.start();

    let recommendFiles;
    let modifyFiles;
    try {
        let jsonObject = await fs.readJson(resolve(`extensions/${dirName}/recommend.json`));
        recommendFiles = jsonObject.list;
        modifyFiles = recommendFiles.map(file => file.replace(/\.recommend\.(\w+)$/, '.$1'));
    }
    catch (e) {
        log.fatal(`Lavas 扩展 ${extensionName} 可能已经损坏，请手动删除`);
        return;
    }

    // npm install package
    console.log('\n');
    let code = shelljs.exec(`npm uninstall ${npmName} --save`).code;
    if (code !== 0) {
        log.fatal(`npm uninstall ${npmName} 失败`);
        return;
    }

    await Promise.all([
        // 删除recommend文件（如果用户忘记删除的话）
        ...recommendFiles.map(file => fs.remove(resolve(file))),
        // 删除extensions目录中的对应扩展
        fs.remove(resolve(`extensions/${dirName}`))
    ]);

    spinner.stop();

    log.info('卸载扩展完毕');
    log.info('为了正确卸载扩展，您还需要修改下列文件以去除对扩展的引用：');
    modifyFiles.forEach(file => {
        log.info(`* ${file}`);
    });
};
