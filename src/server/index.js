/**
 * @file server commander
 * @author mj(zoumiaojiang@gmail.com)
 */

import server from './action';

export default function (program) {

    // 定义 lavas server 命令
    program
        .command('server')
        .alias('s')
        .description('启动 pwa 工程的调试服务器')
        .option('-p, --production', '是否启用真实构建产物预览')
        .action(options => {

            server({
                force: options.force
            });
        })
    ;
}
