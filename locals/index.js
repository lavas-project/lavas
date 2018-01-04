/**
 * @file locals
 * @author mj(zoumiaojiang@gmail.com)
 */

module.exports = function () {
    let lang = (process.env.LANG || '').split('.')[0] || 'zh_CN';

    return require('./' + lang);
};
