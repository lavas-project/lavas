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

const DEFAULT_PROD_SERVER_SCRIPT = 'server.prod.js';
const argv = parseArgs(process.argv.slice(2));
const port = argv.p || argv.port || 3000;

async function startServer(port) {
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

    fork(serverScriptPath);
}

startServer(port);
