/**
 * @file build command for lavas
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const buildAction = require('./build');
const generateAction = require('./generate');

module.exports = function (program) {

    // 定义 lavas build 命令
    program
        .command('build')
        .alias('b')
        .description('构建 Lavas 项目')
        .action(options => buildAction({
            // some options
        }))
    ;

    // 定义 lavas generate 命令
    program
        .command('generate')
        .alias('g')
        .description('编译 Lavas 项目到原生项目')
        .action(options => generateAction({
            // some options
        }))
    ;
};
