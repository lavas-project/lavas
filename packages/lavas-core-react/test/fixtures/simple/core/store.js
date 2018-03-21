'use strict';

/*
    Support:
    1. single reducer file with name that's follow reg like [moduleName]Reducer.js
        - must contain reducer function
    2. reducer under [moduleName] folder

    Allow users create store/index.js to self Manage states of their stores
*/

import {combineReducers} from 'redux';

const context = require.context('@/store', true, /^\.\/.*\.js$/);
const filenames = context.keys();

/**
 * store data
 *
 * @type {Object}
 */
let storeData;

// find index file
// allow users defining their own reducers structure
for (let filename of filenames) {
    if (filename === './index.js') {
        // get index file
        storeData = getModule(filename);
        break;
    }
}

// if storeData is not defined, require all other files, and add them to storeData
if (!storeData) {

    storeData = {};

    for (let filename of filenames) {
        if (filename === './index.js' || ~filename.search(/[aA]ction/)) {
            continue;
        }

        let name = filename.replace(/^\.\//, '').replace(/\.js$/, '').replace(/\/?[rR]educer/, '');
        let paths = name.split('/');
        let store = storeData;

        while (paths.length) {
            let key = paths.shift();
            if (!key) {
                continue;
            }

            if (paths.length) {
                !store[key] && (store[key] = {});
                store = store[key];
            }
            else {
                let mod = getModule(filename);
                if (mod) {
                    store[key] = mod;
                }
            }
        }
    }

    combiner(storeData);

    // if only one reducer under /store folder, no combine op before exporting
    if (Object.keys(storeData).length === 1) {
        let subStore = storeData[Object.keys(storeData)[0]];

        if (typeof storeData === 'function') {
            storeData = subStore;
        }
    }

    if (typeof storeData !== 'function') {
        storeData = combineReducers(storeData);
    }
}

export default storeData;

function combiner(storeTree) {
    for (let state in storeTree) {
        if (storeTree.hasOwnProperty(state)) {
            if (typeof storeTree[state] !== 'function') {
                storeTree[state] = combineReducers(storeTree[state]);
            }
        }
    }
}

/**
 * get module by file name
 *
 * @param {string} filename filename
 * @return {*}
 */
function getModule(filename) {
    const file = context(filename);
    const module = file.default || file;

    if (typeof module !== 'function' && module.reducer && typeof module.reducer !== 'function') {
        throw new Error(
            '[lavas] reducer should be a function in store/' + filename.replace('./', '')
        );
    }

    if (typeof module !== 'function' && !module.reducer) {
        return false;
    }

    // 无法避免 普通命令但是 export default action 的问题，只能约束了？
    return module.reducer || module;
}
