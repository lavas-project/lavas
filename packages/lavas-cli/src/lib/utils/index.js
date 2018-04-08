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
 * @params {Object} options 选项
 * @params {boolean} options.containsFound 结果包含是否是Lavas项目
 *
 * @return {string|Object} 项目根目录，当options.containsFound 为 true时，一并返回是否是Lavas项目
 */
exports.getLavasProjectRoot = function (options = {}) {
    let cwd = process.cwd();
    let pathList = cwd.split(path.sep);

    while (pathList.length > 1) {
        let currentPath = pathList.join(path.sep);
        let fileName = 'package.json';
        let filePath = path.resolve(currentPath, fileName);

        if (fs.existsSync(filePath)) {
            let packageJsonContent = fs.readFileSync(filePath, 'utf-8');
            let packageJson = JSON.parse(packageJsonContent);

            try {
                if (packageJson.lavas || packageJson.dependencies['lavas-core-vue']) {
                    if (options.containsFound) {
                        return {
                            found: true,
                            path: pathList.join(path.sep)
                        };
                    }

                    return pathList.join(path.sep);
                }
            }
            catch (e) {}
        }

        pathList.pop();
    }

    if (options.containsFound) {
        return {
            found: false,
            path: cwd
        };
    }

    return cwd;
};

exports.getLavasCoreVersion = function () {
    let lavasProject = exports.getLavasProjectRoot({containsFound: true})

    if (!lavasProject.found) {
        return;
    }

    let packageJsonPath = path.join(lavasProject.path, 'node_modules/lavas-core-vue/package.json');
    if (!fs.pathExistsSync(packageJsonPath)) {
        return;
    }

    let version = fs.readJsonSync(packageJsonPath).version;
    return version;
}
