/**
 * @file server command for lavas
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const log = require('../utils/log');
const utils = require('../utils');
const DEFAULT_DEV_SERVER_SCRIPT = 'server.dev.js';
const DEFAULT_PROD_SERVER_SCRIPT = 'server.prod.js';

module.exports = function (program) {

    // lavas dev
    program
        .command('dev')
        .description('启动 Lavas 开发环境服务器')
        .option('-p, --port <port>', '指定 port')
        .option('-s, --server-script <server-script>', '指定开发环境服务端脚本')
        .action(async ({port, serverScript}) => {
            let serverScriptPath = path.resolve(
                utils.getLavasProjectRoot(),
                serverScript || DEFAULT_DEV_SERVER_SCRIPT
            );

            log.info('正在启动 Lavas 调试服务器...');

            let isServerScriptExist = await fs.pathExists(serverScriptPath);
            if (!isServerScriptExist) {
                log.warn(`Lavas 没有检测到项目根目录下含有 ${serverScriptPath} 文件!`);
            }
            else {
                process.env.NODE_ENV = 'development';
                if (port) {
                    process.env.PORT = Number(port);
                }
                require(serverScriptPath);
            }
        });

    // lavas start
    program
        .command('start')
        .description('启动 Lavas 生产环境服务器')
        .option('-p, --port <port>', '指定 port')
        .option('-s, --src', '指定生产环境服务端脚本')
        .action(async ({port, serverScript}) => {
            let serverScriptPath = path.resolve(
                utils.getLavasProjectRoot(),
                serverScript || DEFAULT_PROD_SERVER_SCRIPT
            );

            log.info('正在启动 Lavas 调试服务器...');

            let isServerScriptExist = await fs.pathExists(serverScriptPath);
            if (!isServerScriptExist) {
                log.warn(`Lavas 没有检测到项目根目录下含有 ${serverScriptPath} 文件!`);
            }
            else {
                process.env.NODE_ENV = 'production';
                if (port) {
                    process.env.PORT = Number(port);
                }
                require(serverScriptPath);
            }
        });
};
