/**
 * @file 通过 Schema 生成可以让用户输入的 Question Form
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const inquirer = require('inquirer');
const exec = require('mz/child_process').exec;
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const log = require('../../lib/utils/log');
const locals = require('../../locals')();

/**
 * 获取当前用户的 git 账号信息
 *
 * @return {Promise} promise 对象
 */
async function getGitInfo() {
    let author;
    let email;

    try {
        // 尝试从 git 配置中获取
        author = await exec('git config --get user.name');
        email = await exec('git config --get user.email');
    }
    catch (e) {}
    author = author && author[0] && author[0].toString().trim();
    email = email && email[0] && email[0].toString().trim();

    return {author, email};
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
    let con = schema[key];
    let sourceList = [];
    let choiceList = [];
    let text = '';
    let valueList = [];
    let listName = con.name;
    let listLocals = con.locals && con.locals[locals.LANG];
    if (listLocals) {
        listName = listLocals.name;
    }

    if (!con.dependence) {
        sourceList = con.list;
    }
    else if (con.depLevel > 0) {

        // 表示是级联的操作
        let dependence = con.dependence;
        let ref = con.ref;
        let depList = schema[dependence].list;
        let depValue = params[dependence] || schema[dependence].list[0].value;

        depList.forEach(depItem => {
            if (depItem.value === depValue) {
                sourceList = (depItem.subList && depItem.subList[ref]) ? depItem.subList[ref] : [];
            }
        });
    }

    sourceList.forEach((item, index) => {
        let url = '';
        let {desc, name} = item;
        let itemLocals = item.locals && item.locals[locals.LANG];

        if (itemLocals) {
            desc = itemLocals.desc || desc;
            name = itemLocals.name || name;
        }

        desc = log.chalk.gray('\n    ' + desc);

        // if (item.url) {
        //     url = '\n    - ' + log.chalk.yellow.bold.underline(item.url);
        // }
        // else if (item.imgs && item.imgs[0]) {
        //     item.imgs.forEach(imgO => {
        //         let item = '\n    - '
        //             + log.chalk.yellow.bold.underline(imgO.src)
        //             + (imgO.alt ? ' - ' + imgO.alt : '');
        //         url += item;
        //     });
        // }
        // else if (item.img) {
        //     url = '\n    - ' + log.chalk.yellow.bold.underline(item.img);
        // }

        choiceList.push({
            value: item.value,
            name: `${name}${desc}${url}`,
            short: item.value
        });
        valueList.push(item.value);
        text += ''
            + log.chalk.blue('\n    [' + log.chalk.yellow(index + 1) + '] ' + name)
            + desc;
    });

    // 如果是 windows 下的 git bash 环境，由于没有交互 GUI，所以就采用文本输入的方式来解决
    if (os.platform() === 'win32' && process.env.ORIGINAL_PATH) {
        return {
            'type': 'input',
            'name': key,
            'message': locals.PLEASE_INPUT_NUM_DESC + ' ' + listName + '：' + text
                + '\n' + log.chalk.green('?') + ' ' + locals.PLEASE_INPUT_NUM + '：',
            'default': 1,
            'valueList': valueList,
            'validate'(value) {
                if (!/\d+/.test(value) || +value > valueList.length || +value <= 0) {
                    return locals.PLEASE_INPUT_RIGHR_NUM;
                }
                return true;
            }
        };
    }

    return {
        'type': 'list',
        'name': key,
        'message': `${locals.PLEASE_SELECT}${listName} (${log.chalk.green(locals.PLEASE_SELECT_DESC)}): `,
        'choices': choiceList,
        'default': choiceList[0].value || '',
        'checked': !!con.checkbox,
        'pageSize': 1000
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
    let con = schema[key];
    let name = con.name;
    let itemLocals = con.locals && con.locals[locals.LANG];

    if (itemLocals) {
        name = itemLocals.name || name;
    }

    return {
        'type': 'confirm',
        'name': key,
        'default': false,
        'message': `${name}? :`
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
    let con = schema[key];
    let {name, invalidate} = con;
    let defaultVal = con.default;
    let itemLocals = con.locals && con.locals[locals.LANG];

    if (itemLocals) {
        name = itemLocals.name || name;
        defaultVal = itemLocals.default || defaultVal;
        invalidate = itemLocals.invalidate || invalidate;
    }

    con.validate = () => !!1;

    // 如果输入项是 author 或者 email 的，尝试的去 git config 中拿默认的内容
    if (key === 'author' || key === 'email') {
        let userInfo = await getGitInfo();
        defaultVal = userInfo[key] || con.default;
    }
    if (key === 'dirPath') {
        defaultVal = path.resolve(process.cwd(), con.default || '');
        con.validate = value => {
            let nowPath = path.resolve(process.cwd(), value || '');

            if (!fs.existsSync(nowPath)) {
                return invalidate || locals.INPUT_INVALID;
            }
            return true;
        };
    }

    if (con.regExp) {
        let reg = new RegExp(con.regExp);

        con.validate = value => {
            if (!reg.test(value)) {
                return invalidate || locals.INPUT_INVALID;
            }
            return true;
        };
    }

    return {
        'type': con.type === 'password' ? 'password' : 'input',
        'name': key,
        'message': `${locals.PLEASE_INPUT}${name}: `,
        'default': defaultVal,
        'validate': con.validate
    };
}

/**
 * 解析schme, 生成 form 表单
 *
 * @param  {Object} schema  传入的 schema 规则
 * @return {Object}         获取的 form 参数
 */
module.exports = async function (schema) {
    let params = {};

    for (let key of Object.keys(schema)) {
        let con = schema[key];
        let type = con.type;
        let opts = {};
        let data = {};
        switch (type) {
            case 'string':
            case 'number':
            case 'password':
                opts = await questionInput(key, schema, params);
                break;
            case 'boolean':
                opts = questionYesOrNo(key, schema, params);
                break;
            case 'list':
                opts = questionList(key, schema, params);
                break;
        }

        // 如果 list 只有一个 item 的时候，就不需要用户选择了，直接给定当前的值就行
        if (type === 'list' && con.list.length === 1) {
            data[key] = con.list[0].value;
        }
        else if (!con.disable) {
            data = await inquirer.prompt([opts]);
            if (opts.valueList) {
                data[key] = opts.valueList[+data[key] - 1];
            }
        }

        params = Object.assign({}, params, data);
    }

    return params;
};
