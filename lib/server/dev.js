/**
 * @file dev server
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const LavasCore = require('lavas-core');
const Koa = require('koa');

const log = require('../utils/log');
const utils = require('../utils');

/**
 * 处理 dev server 逻辑
 *
 * @param {Object} options action 的参数
 */
module.exports = async function (options) {
    let rootDir = utils.getLavasProjectRoot();
    let serverFile = path.resolve(rootDir, 'server.js');

    log.info('正在启动 Lavas 调试服务器...');

    if (fs.existsSync(serverFile)) {

        // 如果是开发者自己指定的 server.js 启动调试服务器的话
        // lavas dev 的参数都失效，由开发者自己在服务器文件中自行实现逻辑
        require(serverFile);
    }
    else {
        log.warn('Lavas 没有检测到项目根目录下含有 server.js 文件!');

        // 如果项目根目录下不存在 server.js 文件，就走 Lavas 默认的调试服务器
        let app = new Koa();
        let isProd = options.isProd;
        let port = options.port || 3000;

        try {
            let core = new LavasCore(rootDir);

            if (!isProd) {
                await core.build('development');
            }
            else {
                await core.runAfterBuild('production');
            }

            app.use(core.koaMiddleware());
            app.listen(port, () => log.info('已经在 http://localhost:' + port + ' 启动 Lavas 调试服务器'));
        }
        catch (e) {
            console.error(e);
        }
    }
};
