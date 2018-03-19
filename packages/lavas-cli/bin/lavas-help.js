#!/usr/bin/env node
/**
 * @file dev-lavas-cli.js
 * @author <xietianxin> xietianxin@baidu.com
 */

const locals = require('../src/locals')();

console.log(`
Usage
  $ lavas [commands] [options]

Options:
  -v, --version  ${locals.SHOW_VERSION}
  -h, --help     output usage information

Commands:

  init [options]          ${locals.INIT_DESC}
    -f, --force           ${locals.INIT_OPTION_FORCE}
  build|b [config]        ${locals.BUILD_DESC}
  dev [options] [config]  ${locals.START_DEV}
    -p, --port <port>     ${locals.START_PORT}
  start [options]         ${locals.START_PROD}
    -p, --port <port>     ${locals.START_PORT}
  static [options]        ${locals.START_STATIC}
    -p, --port <port>     ${locals.START_PORT}
`);
process.exit(0);
