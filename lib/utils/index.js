/**
 * @file 工具包
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const dns = require('dns');

const CWD = process.cwd();

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
    },


    /**
     * 获取 Lavas 项目的根目录
     *
     * @return {string} 项目根目录
     */
    getLavasProjectRoot() {

        let pathList = CWD.split(path.sep);

        while (pathList.length > 1) {
            let currentPath = pathList.join(path.sep);
            let fileName = 'package.json';
            let filePath = path.resolve(currentPath, fileName);

            if (fs.existsSync(filePath)) {
                let packageJsonContent = fs.readFileSync(filePath, 'utf-8');
                let packageJson = JSON.parse(packageJsonContent);

                if (packageJson.lavas) {
                    return pathList.join(path.sep);
                }
            }
            pathList.pop();
        }

        return CWD;
    }
};
