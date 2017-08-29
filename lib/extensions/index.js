/**
 * @file extensions commander
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

const install = require('./install');

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
};
