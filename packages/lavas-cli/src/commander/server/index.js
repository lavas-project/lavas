/**
 * @file server command for lavas
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');

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
        .option('-c, --config [value]', locals.START_CONFIG)
        .option('-s, --server-script <server-script>', locals.START_SCRIPT)
        .action(async ({port, config, serverScript}) => {
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
        .option('-c, --config [value]', locals.START_CONFIG)
        .option('-s, --src', locals.START_SCRIPT)
        .action(async ({port, config, serverScript}) => {
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
};
