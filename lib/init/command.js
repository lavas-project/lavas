/**
 * @file init commander
 * @author mj(zoumiaojiang@gmail.com)
 */

import init from './index';

export default function (program) {

    // 定义 bpwa init 命令
    program
        .command('init')
        .alias('i')
        .description('初始化 pwa 项目')
        .option('-f, --force', '是否覆盖已有项目')
        .action(options => {

            init({
                force: options.force
            });
        })
    ;
}
