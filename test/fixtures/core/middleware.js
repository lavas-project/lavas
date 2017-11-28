/**
 * @file middleware
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

let files = require.context('@/middlewares', false, /^\.\/.*\.(js|ts)$/);

export default files.keys().reduce((middleware, filename) => {
    let name = filename.slice(2, -3);
    let file = files(filename);
    middleware[name] = file.default || file;
    return middleware;
}, {});
