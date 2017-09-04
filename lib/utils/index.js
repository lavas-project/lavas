/**
 * @file 工具包
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

module.exports = {

    /**
     * 获取项目根目录
     *
     * @return {string} 目录 Path
     */
    getHome() {
        let dir = process.env[
            os.platform() === 'win32'
                ? 'APPDATA'
                : 'HOME'
        ] + path.sep + '.lavas-project';

        // 如果这个目录不存在，则创建这个目录
        !fs.existsSync(dir) && fs.mkdirSync(dir);

        return dir;
    },

    /**
     * 检测当前网络环境
     *
     * @return {boolean} 是否联网
     */
    isNetworkConnect() {
        return new Promise(resolve => {
            dns.lookup('baidu.com', err => resolve(!(err && err.code === 'ENOTFOUND')));
        });
    }
};
