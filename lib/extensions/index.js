/**
 * @file extensions commander
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

const install = require('./install');
const uninstall = require('./uninstall');

module.exports = function (program) {

    // 定义 lavas i 命令 (install 简写)
    program
        .command('i <extension>')
        .description('安装 Lavas 扩展')
        .action(extension => install({
            name: extension
        }));

    // 定义 lavas install 命令
    program
        .command('install <extension>')
        .description('安装 Lavas 扩展')
        .action(extension => install({
            name: extension
        }));

    // 定义 lavas un 命令 (uninstall 简写)
    program
        .command('un <extension>')
        .description('卸载 Lavas 扩展')
        .action(extension => uninstall({
            name: extension
        }));

    // 定义 lavas uninstall 命令
    program
        .command('uninstall <extension>')
        .description('卸载 Lavas 扩展')
        .action(extension => uninstall({
            name: extension
        }));

};
