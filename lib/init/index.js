/**
 * @file init commander
 * @author mj(zoumiaojiang@gmail.com)
 */

const init = require('./action');

module.exports = function (program) {

    // 定义 lavas init 命令
    program
        .command('init')
        .description('初始化 PWA 项目')
        .option('-f, --force', '是否覆盖已有项目')
        .action(options => init({
            force: options.force
        }))
    ;
};
