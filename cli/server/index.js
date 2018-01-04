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
const log = require('../../lib/utils/log');
const utils = require('../../lib/utils');
const locals = require('../../locals')();
const DEFAULT_DEV_SERVER_SCRIPT = 'server.dev.js';
const DEFAULT_PROD_SERVER_SCRIPT = 'server.prod.js';

module.exports = function (program) {

    // lavas dev
    program
        .command('dev')
        .description(locals.START_DEV)
        .option('-p, --port <port>', locals.START_PORT)
        .option('-s, --server-script <server-script>', locals.START_SCRIPT)
        .action(async ({port, serverScript}) => {
            let serverScriptPath = path.resolve(
                utils.getLavasProjectRoot(),
                serverScript || DEFAULT_DEV_SERVER_SCRIPT
            );

            log.info(locals.START_DEV_SERVER + '...');

            let isServerScriptExist = await fs.pathExists(serverScriptPath);
            if (!isServerScriptExist) {
                log.warn(`${locals.START_NO_FILE} ${serverScriptPath}`);
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
        .description(locals.START_PROD)
        .option('-p, --port <port>', locals.START_PORT)
        .option('-s, --src', locals.START_SCRIPT)
        .action(async ({port, serverScript}) => {
            let serverScriptPath = path.resolve(
                utils.getLavasProjectRoot(),
                serverScript || DEFAULT_PROD_SERVER_SCRIPT
            );

            log.info(locals.START_PROD_SERVER + '...');

            let isServerScriptExist = await fs.pathExists(serverScriptPath);
            if (!isServerScriptExist) {
                log.warn(`${locals.START_NO_FILE} ${serverScriptPath}`);
            }
            else {
                process.env.NODE_ENV = 'production';
                if (port) {
                    process.env.PORT = Number(port);
                }
                require(serverScriptPath);
            }
        });

    // lavas static
    // program
    //     .command('static')
    //     .description('启动 Lavas 内置简易服务器')
    //     .option('-p, --port <port>', '指定 port')
    //     .action(async ({port}) => {
    //         port = process.env.PORT || 3000;

    //         let routesJsonPath = path.resolve(utils.getLavasProjectRoot(), 'lavas/routes.json');
    //         // If routes.json exists, set rewrite rules for SPA/MPA.
    //         if (fs.pathExistsSync(routesJsonPath)) {
    //             try {
    //                 let routes = fs.readJsonSync(routesJsonPath);
    //                 let rewrites = routes
    //                     .filter(entry => !entry.ssr)
    //                     .map(entry => {
    //                         let {name, routes, base} = entry;
    //                         return {
    //                             from: routes2Reg(routes),
    //                             to: path.posix.join(base, `/${name}.html`)
    //                         };
    //                     });

    //                 if (rewrites.length !== 0) {
    //                     app.use(historyMiddleware({
    //                         htmlAcceptHeaders: ['text/html'],
    //                         disableDotRule: false, // ignore paths with dot inside
    //                         rewrites
    //                     }));
    //                 }
    //             }
    //             catch (e) {
    //                 // When routes.json is not valid, start as a normal static server.
    //             }
    //         }

    //         // Else, start as a normal static server
    //         app.use(express.static(utils.getLavasProjectRoot()));

    //         app.listen(port, () => {
    //             console.log('server started at localhost:' + port);
    //         });

    //         // catch promise error
    //         process.on('unhandledRejection', (err, promise) => {
    //             console.log('in unhandledRejection');
    //             console.log(err);
    //             // cannot redirect without ctx!
    //         });
    //     });
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
