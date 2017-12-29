/**
 * @file 定义一些快捷方法
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const utils = require('../../lib/utils');
const log = require('../../lib/utils/log');

module.exports = function (program) {

    // 定义 lavas addEntry 命令
    program
        .command('addEntry [entryName]')
        .description('为 Lavas 项目增加入口')
        .action((entryName, options) => {
            // validation
            if (!entryName) {
                log.info('请在命令中输入入口名称，如 lavas addEntry some-entry');
                return;
            }

            if (!/^[a-z_][0-9a-z_\-]{1,213}$/.test(entryName)) {
                log.info(`您输入的入口名称 '${entryName}' 不合法，请重新输入`);
                return;
            }

            let entriesDir = path.resolve(utils.getLavasProjectRoot(), 'entries');
            if (!fs.pathExistsSync(entriesDir)) {
                log.info('没有在您的项目目录找到 entries 目录，请检查后重试');
                return;
            }

            let newEntryPath = path.resolve(entriesDir, entryName);
            if (fs.pathExistsSync(newEntryPath)) {
                log.info(`您的项目中已经存在 ${entryName} 入口，无法重复添加`);
                return;
            }

            log.info(`正在创建入口 ${entryName} ...`);
            // copy entry files
            fs.copySync(path.resolve(__dirname, '../../core/templates/entry'), newEntryPath);

            // modify app.js
            let appJsPath = path.resolve(newEntryPath, 'app.js');
            let appJsContent = fs.readFileSync(appJsPath, {encoding: 'utf-8'});
            appJsContent = appJsContent.replace(/\*__ENTRY_NAME__\*/g, entryName);
            fs.writeFileSync(appJsPath, appJsContent);

            // TODO: add codelab url
            log.info(`入口 ${entryName} 创建完成`);
            log.info('修改根目录下 lavas.config.js 的 entry 数组，增加一项即可导入流量');
        });

    program
        .command('removeEntry [entryName]')
        .description('为 Lavas 删除入口')
        .action((entryName, options) => {
            // validation
            if (!entryName) {
                log.info('请在命令中输入入口名称，如 lavas removeEntry some-entry');
                return;
            }

            let entriesDir = path.resolve(utils.getLavasProjectRoot(), 'entries');
            if (!fs.pathExistsSync(entriesDir)) {
                log.info('没有在您的项目目录找到 entries 目录，请检查后重试');
                return;
            }

            let entryPath = path.resolve(entriesDir, entryName);
            if (!fs.pathExistsSync(entryPath)) {
                log.info(`没有找到对应的入口 ${entryName}`);
                return;
            }

            // remove entry
            fs.removeSync(entryPath);
            // TODO: add codelab url
            log.info(`入口 ${entryName} 删除完成`);
            log.info(`修改根目录下 lavas.config.js 的 entry 数组，删除 ${entryName} 即可完成删除`);
        });
};
