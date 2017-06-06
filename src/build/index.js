/**
 * @file build commander
 * @author mj(zoumiaojiang@gmail.com)
 */

import build from './action';

export default function (program) {

    // 定义 bpwa init 命令
    program
        .command('build')
        .alias('b')
        .description('构建 pwa 工程')
        .option('-r, --release', '是否进行 release 构建')
        .action(options => {

            build({
                force: options.force
            });
        })
    ;
}
