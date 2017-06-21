/**
 * @file cli entry
 * @author mj(zoumiaojiang@gmail.com)
 */

import program from 'commander';
import log  from './log';
import initCommand from './init';
// import analyzeCommand from './analyze';
// import installCommand from './install';
// import serverCommand from './server';
// import buildCommand from './build';
// import lintCommand from './lint';
// import testCommand from './test';


const version = process.env.VERSION || require('../package.json').version;

if (!process.argv[2]) {
    log.info('请查看 \`lavas --help\`');
}
else {
    let argv = process.argv[2];
    if (argv === '-v' || argv === '--version') {
        log.info('version: ', version);
    }
}


// 定义 lavas 命令
program
    // .version(version)
    .usage('[commands] [options]')
    .arguments('<cmd> [env]')
    .option('-v, --version', '查看当前版本')
    .action((cmd, env) => {
        if (env) {
            log.error(`\`lavas ${cmd} '${env}\` 命令不存在`);
        }
        else {
            log.error('`lavas ' + cmd + '` 命令不存在');
        }

        log.info('请查看 `lavas --help`');
    })
;



initCommand(program);
// analyzeCommand(program);
// installCommand(program);
// serverCommand(program);
// buildCommand(program);
// lintCommand(program);
// testCommand(program);



program.parse(process.argv);
