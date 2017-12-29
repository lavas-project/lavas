/**
 * @file lavas scaffold 工具包
 * @author mj(zoumiaojiang@gmail.com)
 */

const shelljs = require('shelljs');

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const dns = require('dns');

/**
 * 系统是否存在某条命令
 *
 * @param  {string}  commandName 命令名
 * @return {boolean}             判断结果
 */
exports.hasCommand = function (commandName) {
    return shelljs.which(commandName);
};

/**
 * 获取项目根目录
 *
 * @return {string} 目录 Path
 */
exports.getHome = function () {
    let dir = process.env[
        os.platform() === 'win32'
            ? 'APPDATA'
            : 'HOME'
    ] + path.sep + '.lavas-project';

    // 如果这个目录不存在，则创建这个目录
    !fs.existsSync(dir) && fs.mkdirSync(dir);

    return dir;
};

/**
 * 检测当前网络环境
 *
 * @return {boolean} 是否联网
 */
exports.isNetworkConnect = function () {
    return new Promise(resolve => {
        dns.lookup('baidu.com', err => resolve(!(err && err.code === 'ENOTFOUND')));
    });
};


/**
 * 获取 Lavas 项目的根目录
 *
 * @return {string} 项目根目录
 */
exports.getLavasProjectRoot = function () {
    let cwd = process.cwd();
    let pathList = cwd.split(path.sep);

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

    return cwd;
};
