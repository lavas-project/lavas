/**
 * @file server command for lavas
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const {fork} = require('child_process');
const express = require('express');
const app = express();
const historyMiddleware = require('connect-history-api-fallback');

const log = require('../../lib/utils/log');
const utils = require('../../lib/utils');
const locals = require('../../locals')();

const DEFAULT_LAVAS_CONFIG = 'lavas.config.js';
const DEFAULT_DEV_SERVER_SCRIPT = 'server.dev.js';
const DEFAULT_PROD_SERVER_SCRIPT = 'server.prod.js';

module.exports = function (program) {

    // lavas dev
    program
        .command('dev [config]')
        .description(locals.START_DEV)
        .option('-p, --port <port>', locals.START_PORT)
        .action(async (config, {port}) => {
            log.info(locals.START_DEV_SERVER + '...');

            // find config file path
            let configPath;
            if (config) {
                if (!path.isAbsolute(config)) {
                    configPath = path.resolve(process.cwd(), config);
                }
            }
            else {
                configPath = path.resolve(utils.getLavasProjectRoot(), DEFAULT_LAVAS_CONFIG);
            }

            if (!(await fs.pathExists(configPath))) {
                log.warn(`${locals.START_NO_FILE} ${configPath}`);
                return;
            }

            // read appDir from config file
            let configJson;
            try {
                configJson = require(configPath);
            }
            catch (e) {
                log.warn(`${locals.INPUT_INVALID} ${configPath}`);
                console.log(e)
                return;
            }

            let appDir = configJson.appDir || utils.getLavasProjectRoot();
            let serverScriptPath = path.resolve(appDir, DEFAULT_DEV_SERVER_SCRIPT);

            let isServerScriptExist = await fs.pathExists(serverScriptPath);
            if (!isServerScriptExist) {
                log.warn(`${locals.START_NO_FILE} ${serverScriptPath}`);
                return;
            }

            process.env.NODE_ENV = 'development';

            if (port) {
                process.env.PORT = Number(port);
            }

            let options = [];
            if (config) {
                options.push(configPath);
            }
            fork(serverScriptPath, options)
        });

    // lavas start
    program
        .command('start')
        .description(locals.START_PROD)
        .option('-p, --port <port>', locals.START_PORT)
        .action(async ({port}) => {
            let serverScriptPath = path.resolve(utils.getLavasProjectRoot(), DEFAULT_PROD_SERVER_SCRIPT);

            let isServerScriptExist = await fs.pathExists(serverScriptPath);
            if (!isServerScriptExist) {
                log.warn(`${locals.START_NO_FILE} ${serverScriptPath}`);
                return;
            }

            process.env.NODE_ENV = 'production';

            if (port) {
                process.env.PORT = Number(port);
            }

            fork(serverScriptPath)
        });

    // lavas static
    program.
        command('static')
        .description(locals.START_STATIC)
        .option('-p, --port <port>', locals.START_PORT)
        .action(async ({port}) => {
            log.info(locals.START_STATIC + '...');

            let routesJsonPath = path.resolve(process.cwd(), 'lavas/routes.json');
            port = port || 8080;

            // start static server with lavas routes configured
            if (await fs.pathExists(routesJsonPath)) {
                try {
                    let baseUrl = require(routesJsonPath).base;
                    if (!baseUrl || baseUrl === '/') {
                        // redirect all requests to '/index.html'
                        app.use(historyMiddleware({
                            htmlAcceptHeaders: ['text/html'],
                            disableDotRule: false // ignore paths with dot inside
                        }));

                        app.use(express.static('.'));
                    }
                    else {
                        // fix trailing '/'
                        // @see https://lavas.baidu.com/guide/v2/advanced/multi-lavas#express-%E5%A4%84%E7%90%86-spa-%E8%B7%AF%E7%94%B1%E7%9A%84%E5%B0%8F%E9%97%AE%E9%A2%98-%E6%89%A9%E5%B1%95
                        if (!baseUrl.endsWith('/')) {
                            baseUrl += '/';
                        }

                        app.use('/', (req, res, next) => {
                            let requestUrl = req.url.replace(/\?.+?$/, '');

                            if (requestUrl === baseUrl.substring(0, baseUrl.length - 1)) {
                                req.url = requestUrl + '/';
                            }

                            next();
                        });

                        app.use(baseUrl, historyMiddleware({
                            htmlAcceptHeaders: ['text/html'],
                            disableDotRule: false // ignore paths with dot inside
                        }));

                        app.use(baseUrl, express.static('.'));
                    }
                }
                catch (e) {}
            }
            // start a normal static server
            else {
                app.use(express.static('.'));
            }

            app.listen(port, () => log.info(`Static server start at localhost:${port}`));
        });
};
