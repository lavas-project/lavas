/**
 * @file lavas scaffold entry
 * @author mj(zoumiaojiang@gmail.com)
 */

const path = require('path');

const _ = require('lodash');

const lavasSchema = require('./schema');
const lavasTemplate = require('./template');
const store = require('./store');

/**
 * 获取导出的所有的 fields （包含 default 参数）
 *
 * @param  {Object} fields  传入的 fields
 * @param  {Obejct} templateConf    模版的配置
 * @return {Object}         输出的 fields
 */
async function extendsDefaultFields(fields = {}, templateConf = {}) {
    let defaultFields = {};
    let schema = store.get('schema') || await lavasSchema.getSchema(templateConf);

    Object.keys(schema).forEach(key => (defaultFields[key] = schema[key].default));

    /* eslint-disable fecs-use-computed-property */
    defaultFields.name = fields.name || 'lavas-pwa';
    defaultFields.dirPath = path.resolve(process.cwd(), fields.dirPath || '', defaultFields.name);

    return _.merge({}, defaultFields, fields);
}

/**
 * 获取元 Schema - 涉及模版下载的 Schema
 *
 * @return {Promise<*>}   Meta Schema
 */
exports.getMetaSchema = async function () {
    return store.get('metaSchema') || await lavasSchema.getMetaSchema();
};

/**
 * 获取 Schema - 涉及模版渲染的 Schema
 *
 * @param {Object} templateConf 模版自己的配置
 * @return {Promise<*>}   Schema
 */
exports.getSchema = async function (templateConf = {}) {
    if (!templateConf) {
        // 如果实在没有提前下载模板，就现用默认的参数下载一个
        templateConf = await lavasTemplate.download();
    }
    return lavasSchema.getSchema(templateConf);
};

/**
 * 通过指定的 meta 参数下载模版，下载成功后返回模板的 Schema 信息
 *
 * @param {Object} metaParams 导出参数
 * @return {*} 下载的临时路径 或者 报错对象
 */
exports.download = async function (metaParams = {}) {
    metaParams = await extendsDefaultFields(metaParams);

    return await lavasTemplate.download(metaParams);
};

/**
 * 通过指定的参数渲染下载成功的模板
 *
 * @param {Object} params 导出参数
 * @param {Object} templateConf 模版的配置
 * @return {Promise<*>}   导出的结果
 */
exports.render = async function (params = {}, templateConf) {

    if (!templateConf) {
        // 如果实在没有提前下载模板，就现用默认的参数下载一个（这个模板是默认的）
        templateConf = await lavasTemplate.download();
    }

    params = await extendsDefaultFields(params, templateConf);
    return await lavasTemplate.render(params);
};

if (process.env.NODE_ENV === 'development') {
    console.log('Woow! You are in development!!!');
}
