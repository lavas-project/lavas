#!/usr/bin/env node
/**
 * @file dev-lavas-cli.js
 * @author <xietianxin> xietianxin@baidu.com
 */

const parseArgs = require('minimist');

const init = require('../src/commander/scaffold/action');

const argv = parseArgs(process.argv.slice(2));
const isForce = argv.f || argv.force;
init({
    force: isForce
});
