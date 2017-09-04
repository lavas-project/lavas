/**
 * @file server command for lavas
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const startAction = require('./start');
const devAction = require('./dev');

module.exports = function (program) {

    // 定义 lavas start 命令
    program
        .command('start')
        .alias('s')
        .description('启动 Lavas SSR 服务')
        .option('-p, --port <port>', '指定 port')
        .option('-H, --hostname <hostname>', '指定 hostname')
        .option('-s, --spa', '指定 SPA 模式')
        .action(options => startAction({
            port: options.port,
            hostname: options.hostname,
            isSpa: options.spa
        }))
    ;

    // 定义 lavas dev 命令
    program
        .command('dev')
        .description('启动 Lavas 调试服务')
        .option('-p, --port <port>', '指定 port')
        .option('-H, --host <host>', '指定 host')
        .option('-s, --spa', '指定 SPA 模式')
        .action(options => devAction({
            port: options.port,
            host: options.host,
            isSpa: options.spa
        }))
    ;
};
