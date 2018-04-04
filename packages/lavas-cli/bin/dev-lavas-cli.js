#!/usr/bin/env node
/**
 * @file dev-lavas-cli.js
 * @author <xietianxin> xietianxin@baidu.com
 */

const pkg = require('../package.json');
const log = require('../src/lib/utils/log');
const locals = require('../src/locals')();
const path = require('path');

const defaultCommand = 'help';
const commands = new Set([
    'init',
    'build',
    'dev',
    'start',
    'static',
    defaultCommand
]);

let cmd = process.argv[2];
let args = [];

if (new Set(['--version', '-v']).has(cmd)) {
    log.info('version: ', pkg.version);
    process.exit(0);
}

if (new Set(['--help', '-h']).has(cmd)) {
    cmd = 'help';
}

if (new Set(['b']).has(cmd)) {
    cmd = 'build';
}

if (commands.has(cmd)) {
    args = process.argv.slice(3);
}
else {
    args = process.argv.slice(2);
    if (args.length) {
        log.error(['`lavas', ...args, '`', locals.NO_COMMAND].join(' '));
        process.exit(0);
    }
    else {
        cmd = defaultCommand;
    }
}
const bin = path.join(__dirname, 'lavas-' + cmd);

require(bin);
