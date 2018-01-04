/**
 * @file init commander
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const init = require('./action');
const locals = require('../../locals')();

module.exports = function (program) {

    // define lavas init command
    program
        .command('init')
        .description(locals.INIT_DESC)
        .option('-f, --force', locals.INIT_OPTION_FORCE)
        .action(options => init({
            force: options.force
        }));
};
