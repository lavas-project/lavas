/**
 * @file lint commander
 * @author mj(zoumiaojiang@gmail.com)
 */

import test from './action';

export default function (program) {

    // 定义 bpwa init 命令
    program
        .command('lint')
        .alias('l')
        .description('检测 pwa 工程的代码规范')
        .option('-f, --force', '是否覆盖已有项目')
        .action(options => {

            test({
                force: options.force
            });
        })
    ;
}
