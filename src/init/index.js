/**
 * @file init commander
 * @author mj(zoumiaojiang@gmail.com)
 */

import init from './action';

export default function (program) {

    // 定义 lavas init 命令
    program
        .command('init')
        .description('初始化 pwa 项目')
        .option('-f, --force', '是否覆盖已有项目')
        .action(options => {

            init({
                force: options.force
            });
        })
    ;
}
