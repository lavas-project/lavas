/**
 * @file build command for lavas
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const buildAction = require('./build');
const locals = require('../../locals')();

module.exports = function (program) {

    // 定义 lavas build 命令
    program
        .command('build [config]')
        .alias('b')
        .description(locals.BUILD_DESC)
        .action(async config => buildAction(config))
    ;
};
