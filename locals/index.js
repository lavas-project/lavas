/**
 * @file locals
 * @author mj(zoumiaojiang@gmail.com)
 */

module.exports = function () {
    let lang = process.env.LANG || 'zh_CN';

    if (/zh/g.test(lang)) {
        return require('./zh_CN');
    }

    return require('./en');
};
