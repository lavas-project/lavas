/**
 * @file templates modules
 * @author mj(zoumiaojiang@gmail.com)
 */

/* eslint-disable fecs-prefer-async-await */
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const archiver = require('archiver');
const etpl = require('etpl');
const Ajv = require('ajv');
const axios = require('axios');
const compressing = require('compressing');

const conf = require('./config');
const getMeta = require('./getMeta');
const store = require('./store');
const schema = require('./schema');
const locals = require('../../locals')();

/**
 * 通过指定框架名和模版名从服务器上拉取模版（要求在模版 relase 的时候注意上传的 CDN 路径）
 *
 * @param {string} framework 框架名称
 * @param {string} template 模版名称
 * @param {string} targetPath 模版下载后存放路径
 */
async function downloadTemplateFromCloud(framework, template, targetPath) {
    const outputFilename = path.resolve(targetPath, 'template.tar.gz');
    fs.existsSync(targetPath) && fs.removeSync(targetPath);
    fs.mkdirsSync(targetPath);

    framework = (framework || 'vue').toLowerCase();
    template = (template || 'basic').toLowerCase();

    try {
        let result = await axios.request({
            responseType: 'arraybuffer',
            url: `${conf.TAR_GZ_ENDPOINT}${framework}/${template}/templates.tar.gz`,
            method: 'get',
            headers: {
                'Content-Type': 'application/x-gzip'
            }
        });

        fs.writeFileSync(outputFilename, result.data);

        // 解压缩是反响过程，接口都统一为 uncompress
        await compressing.tgz.uncompress(outputFilename, targetPath);
        fs.removeSync(outputFilename);
    }
    catch (e) {
        throw new Error(locals.DOWNLOAD_TEMPLATE_ERROR);
    }
}

/**
 * 删除某个目录中的指定文件或文件夹
 *
 * @param {string} dir 根目录
 * @param {*} ignores 过滤的文件或文件夹数组
 */
function deleteFilter(dir, ignores = []) {
    ignores
        .concat(...conf.DEFAULT_EXPORTS_IGNORES)
        .forEach(target => {
            let targetPath = path.resolve(dir, target);
            fs.existsSync(targetPath) && fs.removeSync(targetPath);
        });
}


/**
 * 给 Lavas 工程指定 package.json 文件
 *
 * @param {string} dir    指定添加 package.json 文件的目录
 * @param {Object} params 渲染的参数
 */
function addPackageJson(dir, params) {
    let templateConfig = store.get('templateConfig');
    let version = store.get('version') || '2';
    let etplCompile = new etpl.Engine(templateConfig.etpl || conf.ETPL);
    let packageJson = templateConfig.exportsPackageJson;

    packageJson.lavas = {
        core: templateConfig.core || 'lavas-core-vue',
        version
    };

    let fileName = 'package.json';
    let filePath = path.resolve(dir, fileName);
    let fileContent = (packageJson && typeof packageJson === 'object')
        ? JSON.stringify(packageJson, null, 4)
        : fs.readFileSync(path.resolve(__dirname, 'templates', 'package.json'), 'utf8')
    ;

    // 如果没有在模版中指定 package.json 的时候，就需要使用默认的文件了
    params.lavasCoreName = templateConfig.core || 'lavas-core-vue';
    fileContent = etplCompile.compile(fileContent)(params);

    fs.writeFileSync(filePath, fileContent);
}

/**
 * 渲染 template 里面的所有文件
 *
 * @param  {Object} params    收集的用户输入字段
 * @param  {string} tmpStoreDir  临时文件夹存储路径
 * @return {Promise}          渲染 promise
 */
function renderTemplate(params, tmpStoreDir) {
    let templateConfig = store.get('templateConfig');
    let dirPath = params.dirPath || process.cwd();
    let etplCompile = new etpl.Engine(templateConfig.etpl || conf.ETPL);

    // 把指定的开发者不需要的文件和文件夹都删掉
    deleteFilter(tmpStoreDir, templateConfig.exportsIgnores);

    return new Promise((resolve, reject) => glob(
        '**/*',
        {
            cwd: tmpStoreDir,
            ignore: (templateConfig.renderIgnores || []).concat(...conf.DEFAULT_RENDER_IGNORES)
        },
        (err, files) => {
            files.forEach(file => {
                let filePath = path.resolve(tmpStoreDir, file);

                if (fs.statSync(filePath).isFile()) {
                    let content = fs.readFileSync(filePath, 'utf8');

                    // 这里可以直接通过外界配置的规则，重新计算出一份数据，只要和 template 里面的字段对应上就好了
                    let extDataTpls = templateConfig.extData || {};
                    let extData = {};
                    let commonData = conf.COMMON_DATA;

                    Object.keys(extDataTpls).forEach(key => {
                        extData[key] = etplCompile.compile(`${extDataTpls[key]}`)(params);
                    });

                    let renderData = Object.assign({}, params, extData, commonData);
                    let afterCon = etplCompile.compile(content)(renderData);

                    fs.writeFileSync(filePath, afterCon);
                }
            });

            addPackageJson(tmpStoreDir, params);

            if (params.isStream) {
                let archive = archiver('zip', {zlib: {level: 9}});
                let tmpZipPath = path.resolve(tmpStoreDir, '..', 'tmp.zip');
                let output = fs.createWriteStream(tmpZipPath);

                archive.pipe(output);
                archive.directory(tmpStoreDir, params.name);
                archive.finalize().on('finish', () => resolve(fs.createReadStream(tmpZipPath)));
            }
            else {
                fs.copySync(tmpStoreDir, dirPath);
                resolve(dirPath);
            }
        }
    ));
}

/**
 * 获取模版信息
 *
 * @param  {Object} metaParam 元参数
 * @return {Object} framework 和 template 信息
 */
async function getTemplateInfo(metaParam) {
    try {
        let meta = await getMeta();
        let frameworkValue = metaParam.framework || meta.defaults.framework || 'vue';
        let templateValue = metaParam.template || meta.defaults.template || 'lavasTemplate';
        let framework = meta.frameworks.filter(item => item.value === frameworkValue)[0];
        let template = framework.subList.template.filter(item => item.value === templateValue)[0];
        let version = meta.version;

        store.set('framework', framework);
        store.set('template', template);
        store.set('version', version);

        return {
            framework,
            template,
            version
        };
    }
    catch (e) {
        // 如果这一步出错了，只能说明是 BOS 上的 Meta 配置格式错误。。
        throw new Error(locals.META_TEMPLATE_ERROR);
    }
}

/**
 * 下载一个指定的模版
 *
 * @param  {Object} metaParams  导出模版所需字段, 从 mataSchema 中得出
 * @return {Objecy}             导出的结果
 */
exports.download = async function (metaParams = {}) {
    let {framework, template, version} = await getTemplateInfo(metaParams);
    let storeDir = path.resolve(
        conf.LOCAL_TEMPLATES_DIR,
        framework.value, template.value + '_' + version
    );
    let ajv = new Ajv({allErrors: true});
    let metaJsonSchema = store.get('metaJsonSchema') || await schema.getMetaJsonSchema();
    let validate = ajv.compile(metaJsonSchema);
    let valid = validate(metaParams);

    if (!valid) {
        throw new Error(JSON.stringify(validate.errors));
    }

    await downloadTemplateFromCloud(framework.value, template.value, storeDir);
    store.set('storeDir', storeDir);

    let templateConfigContent = fs.readFileSync(path.resolve(storeDir, 'meta.json'), 'utf-8');
    let templateConfig = JSON.parse(templateConfigContent);

    store.set('templateConfig', templateConfig);

    return templateConfig;
};

/**
 * 渲染指定的模板模版
 *
 * @param {Object} params 收集到的用户输入的参数
 * @return {*} 导出的结果
 */
exports.render = async function (params) {
    let templateConfig = store.get('templateConfig') || await this.download(params);
    let tmpStoreDir = path.resolve(conf.LOCAL_TEMPLATES_DIR, `${Date.now()}`);
    let storeDir = store.get('storeDir');
    let ajv = new Ajv({allErrors: true});
    let jsonSchema = schema.getJsonSchema(templateConfig);
    let validate = ajv.compile(jsonSchema);
    let valid = validate(params);

    if (!valid) {
        throw new Error(JSON.stringify(validate.errors));
    }

    try {
        if (!fs.existsSync(storeDir)) {
            await this.download(params);
        }

        fs.mkdirsSync(tmpStoreDir);
        fs.copySync(storeDir, tmpStoreDir);

        let renderResult = await renderTemplate(params, tmpStoreDir);

        fs.removeSync(tmpStoreDir);

        return renderResult;
    }
    catch (e) {
        throw new Error(locals.RENDER_TEMPLATE_ERROR);
    }
};
