/**
 * @file server command for lavas
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const pathToRegexp = require('path-to-regexp');
const historyMiddleware = require('connect-history-api-fallback');

const app = express();
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

            log.info('正在启动 Lavas 正式服务器...');

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

    // lavas server
    program
        .command('server')
        .description('启动 Lavas 内置简易服务器')
        .option('-p, --port <port>', '指定 port')
        .action(async ({port}) => {
            port = process.env.PORT || 3000;

            let routesJsonPath = path.resolve(utils.getLavasProjectRoot(), 'lavas/routes.json');
            // If routes.json exists, set rewrite rules for SPA/MPA.
            if (fs.pathExistsSync(routesJsonPath)) {
                let routes = fs.readJsonSync(routesJsonPath);
                let rewrites = routes
                    .filter(entry => !entry.ssr)
                    .map(entry => {
                        let {name, routes, base} = entry;
                        return {
                            from: routes2Reg(routes),
                            to: path.posix.join(base, `/${name}.html`)
                        };
                    });

                if (rewrites.length !== 0) {
                    app.use(historyMiddleware({
                        htmlAcceptHeaders: ['text/html'],
                        disableDotRule: false, // ignore paths with dot inside
                        rewrites
                    }));
                }
            }

            // Else, start a normal static server
            app.use(express.static(utils.getLavasProjectRoot()));

            app.listen(port, () => {
                console.log('server started at localhost:' + port);
            });

            // catch promise error
            process.on('unhandledRejection', (err, promise) => {
                console.log('in unhandledRejection');
                console.log(err);
                // cannot redirect without ctx!
            });
        });
};

function routes2Reg(routes) {
    if (typeof routes === 'string') {
        let match = routes.match(/^\/(.+)\/$/);
        if (match) {
            return new RegExp(match[1], 'i');
        }

        return pathToRegexp(routes);
    }

    return routes;
}
