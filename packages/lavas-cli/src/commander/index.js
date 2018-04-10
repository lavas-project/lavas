/**
 * @file cli entry
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const program = require('commander');
const exec = require('mz/child_process').exec;

const log = require('../lib/utils/log');
const checkUpdate = require('../lib/utils/checkUpdate');
const initCommand = require('./scaffold');
const buildCommand = require('./build');
const serverCommand = require('./server');
const locals = require('../locals')();
const utils = require('../lib/utils');

let version = process.env.VERSION || require('../../package.json').version;

// check the latest version
checkUpdate().then(async () => {
    if (!process.argv[2]) {
        let output = await exec('lavas -h');
        console.log(output[0]);
    }
    else {
        let argv = process.argv[2];

        if (argv === '-v' || argv === '--version') {
            // show lavas-cli version
            log.info('lavas version: ', version);

            // if lavas project, show lavas-core-vue version
            let lavasCoreVersion = utils.getLavasCoreVersion();
            if (lavasCoreVersion) {
                log.info('lavas-core-vue version:', lavasCoreVersion);
            }
        }
    }

    // define lavas command
    program
        .usage('[commands] [options]')
        .arguments('<cmd> [env]')
        .option('-v, --version', locals.SHOW_VERSION)
        .action((cmd, env) => {
            if (env) {
                log.error(`\`lavas ${cmd} ${env}\` ${locals.NO_COMMAND}`);
            }
            else {
                log.error('`lavas ' + cmd + '` ' + locals.NO_COMMAND);
            }

            log.info(locals.PLEASE_SEE + ' `lavas --help`');
        });

    initCommand(program);
    buildCommand(program);
    serverCommand(program);

    program.parse(process.argv);
});
