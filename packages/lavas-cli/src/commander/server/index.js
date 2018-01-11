/**
 * @file server command for lavas
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const {fork} = require('child_process');

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
};
