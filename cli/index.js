/**
 * @file cli entry
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const program = require('commander');
const cp = require('child_process');

const log = require('../lib/utils/log');
const checkUpdate = require('../lib/utils/checkUpdate');
const initCommand = require('./scaffold');
const buildCommand = require('./build');
const serverCommand = require('./server');
const locals = require('../locals')();

let version = process.env.VERSION || require('../../package.json').version;

// check the latest version
checkUpdate().then(() => {
    if (!process.argv[2]) {
        cp.exec('lavas -h', (err, stdout, stderr) => {
            if (err) {
                throw err;
            }
            console.log(stdout);
        });
    }
    else {
        let argv = process.argv[2];

        if (argv === '-v' || argv === '--version') {
            log.info('version: ', version);
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
