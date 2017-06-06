/**
 * @file analyze commander
 * @author mj(zoumiaojiang@gmail.com)
 */

import analyze from './action';

export default function (program) {

    // 定义 bpwa analyze 命令
    program
        .command('analyze')
        .alias('a')
        .description('分析 pwa 工程是否符合规范')
        .option('-r, --report', '产出分析报告页面')
        .action(options => {

            analyze({
                force: options.force
            });
        })
    ;
}
