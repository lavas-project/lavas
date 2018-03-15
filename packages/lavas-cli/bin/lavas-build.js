#!/usr/bin/env node

const parseArgs = require('minimist');
const path = require('path')

const buildAction = require('../src/commander/build/build');

const argv = parseArgs(process.argv.slice(2));
const conf = argv._[1]?path.join(process.cwd(), argv._[1]):'';

buildAction(conf);