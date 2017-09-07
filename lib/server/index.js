/**
 * @file server command for lavas
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const devAction = require('./dev');

module.exports = function (program) {

    // 定义 lavas dev 命令
    program
        .command('dev')
        .description('启动 Lavas 调试服务')
        .option('-p, --port <port>', '指定 port')
        .option('-P, --production', '是否为生产环境的服务器')
        .action(options => devAction({
            port: options.port,
            isProd: options.production
        }))
    ;
};
