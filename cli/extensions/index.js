/**
 * @file extensions commander
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

const install = require('./install');
const uninstall = require('./uninstall');

module.exports = function (program) {

    // 定义 install 命令
    program
        .command('install <extension>')
        .alias('i')
        .description('安装 Lavas 扩展')
        .action(extension => install({
            name: extension
        }));

    // 定义 lavas uninstall 命令
    program
        .command('uninstall <extension>')
        .alias('un')
        .description('卸载 Lavas 扩展')
        .action(extension => uninstall({
            name: extension
        }));

};
