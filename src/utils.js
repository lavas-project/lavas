/**
 * @file 工具包
 * @author mj(zoumiaojiang@gmail.com)
 */


import os from 'os';
import fs from 'fs';
import path from 'path';

export default {
    getSDKHome() {
        const dir = process.env[
            os.platform() === 'win32'
                ? 'APPDATA'
                : 'HOME'
            ] + path.sep + '.bpwa-cli';

        // 如果这个目录不存在，则创建这个目录
        !fs.existsSync(dir) && fs.mkdirSync(dir);
        return dir;
    }
};
