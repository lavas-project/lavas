/**
 * @file build command for lavas
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const buildAction = require('./build');

module.exports = function (program) {

    // 定义 lavas build 命令
    program
        .command('build')
        .alias('b')
        .description('为生产环境构建 Lavas 项目')
        .action(options => buildAction({
            // some options
        }))
    ;
};
