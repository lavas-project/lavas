/**
 * @file server command for lavas, used like `lavas start`
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

module.exports = function (program) {

    // 定义 lavas start 命令
    program
        .command('start')
        .alias('s')
        .description('启动 Lavas SSR 服务')
        .option('-p, --port', '指定端口号')
        .action(options => !!false)
    ;

    // 定义 lavas dev 命令
    program
        .command('dev')
        .alias('d')
        .description('启动 Lavas 调试服务')
        .option('-p, --port', '指定端口号')
        .action(option => !!false)
    ;
};
