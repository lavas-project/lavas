#!/usr/bin/env node

const parseArgs = require('minimist');

const init = require('../src/commander/scaffold/action');

const argv = parseArgs(process.argv.slice(2));
const isForce = argv.f || argv.force
init({
    force: isForce
});