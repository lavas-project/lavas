/**
 * @file 通过schema 生成 from qustion
 * @author mj(zoumiaojiang@gmail.com)
 */

import log from '../log';
import inquirer from 'inquirer';
import childProcess from 'child_process';

import path from 'path';
import fs from 'fs-extra';


/**
 * 获取当前用户的 git 账号信息
 *
 * @return {Promise} promise 对象
 */
function getGitInfo() {
    const exec = childProcess.execSync;

    return new Promise((resolve, reject) => {
        let author = '';
        let email = '';
        try {
            // 尝试从 git 配置中获取
            author = exec('git config --get user.name');
            email = exec('git config --get user.email');
        }
        catch (e) {}
        author = author && author.toString().trim();
        email = email && email.toString().trim();
        resolve({author, email});
    });
}

/**
 * 询问 list 类型的参数 (多选或者单选)
 *
 * @param  {string} key    参数的 key
 * @param  {Object} schema schema 内容
 * @param  {Object} params 当前已有的参数
 * @return {Object}        question 需要的参数
 */
function questionList(key, schema, params) {
    let con = schema.properties[key];
    let sourceList = [];
    let choiceList = [];

    if (!con.dependence) {
        sourceList = con.list;
    }
    else if (con.depLevel > 0) {

        // 表示是级联的操作
        let dependence = con.dependence;
        let ref = con.ref;
        let depList = schema.properties[dependence].list;

        for (let depItem of depList) {
            if (depItem.value === params[dependence]) {
                sourceList = depItem.subList[ref];
            }
        }
    }

    sourceList.forEach(item => {

        let url = item.url || (item.imgs && item.imgs[0] && item.imgs[0].src) || item.img;
        let extText = url ? log.chalk.yellow.bold.underline(url) : '';

        choiceList.push({
            'value': item.value,
            'name': `${item.value} ${extText}`,
            'short': item.value
        });
    });

    return {
        'type': 'list',
        'name': key,
        'message': `选择一个${con.name}: `,
        'choices': choiceList,
        'default': choiceList[0]

    };
}

/**
 * 询问 boolean 类型的参数
 *
 * @param  {string} key    参数的 key
 * @param  {Object} schema schema 内容
 * @param  {Object} params 当前已有的参数
 * @return {Object}        question 需要的参数
 */
function questionYesOrNo(key, schema, params) {
    let con = schema.properties[key];
    return {
        'type': 'confirm',
        'name': key,
        'default': false,
        'message': `${con.name}? :`
    };
}


/**
 * 询问 input 类型的参数
 *
 * @param  {string} key    参数的 key
 * @param  {Object} schema schema 内容
 * @param  {Object} params 当前已有的参数
 * @return {Object}        question 需要的参数
 */
async function questionInput(key, schema, params) {
    let userInfo = await getGitInfo();
    let con = schema.properties[key];
    let name = con.name;


    con.validate = function () {
        return true;
    };

    // 如果输入项是 author 或者 email 的，尝试的去 git config 中拿默认的内容
    if (key === 'author' || key === 'email') {
        con.default = userInfo[key] || con.default;
    }
    if (key === 'dirPath') {
        con.default = path.resolve(process.cwd(), con.default || '');
        con.validate = value => {
            const nowPath = path.resolve(process.cwd(), value);

            if (!fs.existsSync(nowPath)) {
                return con.invalidate || '输入不符合规范';
            }
            return true;
        };
    }

    if (con.regExp) {
        const reg = new RegExp(con.regExp);
        con.validate = value => {
            if (!reg.test(value)) {
                return con.invalidate || '输入不符合规范';
            }
            return true;
        };
    }

    return {
        'type': 'input',
        'name': key,
        'message': `请输入${name}: `,
        'default': con.default,
        'validate': con.validate
    };
}


/**
 * 解析schme, 生成 form 表单
 *
 * @param  {Object} schema  传入的 schema 规则
 * @return {Object}         获取的 form 参数
 */
export default (async function (schema) {
    let params = {};

    for (let key of Object.keys(schema.properties) || []) {
        let con = schema.properties[key];
        let type = con.type;
        let opts = {};

        switch (type) {
            case 'string':
            case 'number':
                opts = await questionInput(key, schema, params);
                break;
            case 'boolean':
                opts = questionYesOrNo(key, schema, params);
                break;
            case 'list':
                opts = questionList(key, schema, params);
                break;
        }

        let data = await inquirer.prompt([opts]);
        params = Object.assign(params, data);
    }

    return params;
});
