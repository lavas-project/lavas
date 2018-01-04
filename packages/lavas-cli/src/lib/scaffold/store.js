/**
 * @file 简单的 store
 * @author mj(zoumiaojiang@gmail.com)
 */

'use strict';

const store = {};

module.exports = {

    /**
     * setter
     *
     * @param {string} name  store key
     * @param {any} value    store value
     */
    set(name, value) {
        store[name] = value;
    },

    /**
     * getter
     *
     * @param  {string} name  store key
     * @return {[type]}       store value
     */
    get(name) {
        return store[name];
    }
};
