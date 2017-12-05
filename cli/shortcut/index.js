/**
 * @file 定义一些快捷方法
 * @author wangyisheng@baidu.com (wangyisheng)
 */

'use strict';

module.exports = function (program) {

    // 定义 lavas addEntry 命令
    program
        .command('addEntry')
        .description('为 Lavas 项目增加入口')
        .action(options => buildAction({
            // some options
        }));
};
