#!/usr/bin/env node
/**
 * @file dev-lavas-cli.js
 * @author <xietianxin> xietianxin@baidu.com
 */

const parseArgs = require('minimist');
const fs = require('fs-extra');
const path = require('path');
const fork = require('child_process').fork;

const utils = require('../src/lib/utils');
const locals = require('../src/locals')();
const log = require('../src/lib/utils/log');

const DEFAULT_LAVAS_CONFIG = 'lavas.config.js';
const DEFAULT_DEV_SERVER_SCRIPT = 'server.dev.js';
const argv = parseArgs(process.argv.slice(2));
const port = argv.p || argv.port || 3000;
const conf = argv._[1] || '';

async function devServer(config, port) {
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
    fork(serverScriptPath, options);
}

devServer(conf, port);
