/**
 * @file install commander
 * @author mj(zoumiaojiang@gmail.com)
 */

import install from './action';

export default function (program) {

    // 定义 bpwa install 命令
    program
        .command('install')
        .alias('i')
        .description('安装 pwa 工程开发和运行时所需的依赖包')
        .option('-f, --force', '是否覆盖已有项目')
        .action(options => {

            install({
                force: options.force
            });
        })
    ;
}
