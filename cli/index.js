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
const shortcutCommand = require('./shortcut');

let version = process.env.VERSION || require('../../package.json').version;

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


// 定义 lavas 命令
program
    .usage('[commands] [options]')
    .arguments('<cmd> [env]')
    .option('-v, --version', '查看当前版本')
    .action((cmd, env) => {
        if (env) {
            log.error(`\`lavas ${cmd} ${env}\` 命令不存在`);
        }
        else {
            log.error('`lavas ' + cmd + '` 命令不存在');
        }

        log.info('请查看 `lavas --help`');
    });

initCommand(program);
buildCommand(program);
serverCommand(program);
shortcutCommand(program);

// 检查版本更新
checkUpdate();
program.parse(process.argv);
