/**
 * @file build command for lavas, used like `lavas build`
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

module.exports = function (program) {

    // 定义 lavas build 命令
    program
        .command('build')
        .description('构建 Lavas 项目')
        .option('-u, --uglyfiy', '是否压缩')
        .action(options => !!false)
    ;

    // 定义 lavas generate 命令
    program
        .command('generate')
        .alias('g')
        .description('编译 Lavas 项目到原生项目')
        .option('-u, --uglyfiy', '是否压缩')
        .action(options => !!false)
    ;
};
