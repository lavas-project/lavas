/**
 * @file lint commander
 * @author mj(zoumiaojiang@gmail.com)
 */

import lint from './action';

export default function (program) {

    // 定义 lavas init 命令
    program
        .command('lint')
        .alias('l')
        .description('检测 pwa 工程的代码规范')
        .option('--ignore', '指定需要忽略的文件模式')
        .option('--debug', '是否允许直接抛出 lint 的运行时错误')
        .option('--silent', '是否隐藏所有通过 console.log 输出的信息')
        .option('--type', '指定要处理的文件类型，类型之间以 `,` 分隔，默认值js,css,html')
        .action(options => lint({
            ignore: options.ignore,
            debug: options.debug,
            silent: options.silent,
            type: options.type
        }))
    ;
}
