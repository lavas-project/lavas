/**
 * @file 检查代码规范
 * @author mj(zoumiaojiang@gmail.com)
 */

import fecs from 'fecs';
import path from 'path';
import log from '../log';


const cwd = process.cwd();


/**
 * 检查 pwa 项目代码规范入口
 *
 * @param {Object} conf 初始化配置
 */
export default (async function (conf) {

    log.info('开始检查代码...');

    let options = {
        _: [
            cwd
        ]
    };

    fecs.leadName = 'LAVAS';
    fecs.check(options, (success, errors) => {
        log.info('检查完成');
    });

});
