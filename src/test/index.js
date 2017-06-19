/**
 * @file test commander
 * @author mj(zoumiaojiang@gmail.com)
 */

import test from './action';

export default function (program) {

    // 定义 lavas init 命令
    program
        .command('test')
        .alias('t')
        .description('测试 pwa 工程')
        .option('-f, --force', '是否覆盖已有项目')
        .action(options => {

            test({
                force: options.force
            });
        })
    ;
}
