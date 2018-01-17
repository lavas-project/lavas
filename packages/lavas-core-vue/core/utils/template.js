/**
 * @file utils.template.js
 * 处理前后端模板统一 (SSR & SPA)
 * @author lavas
 */

import template from 'lodash.template';

function inner(customTemplate, ssr) {
    let temp = template(customTemplate)({ssr});
    return temp.replace(/<</g, '<%').replace(/>>/g, '%>');
}

export default {
    client: customTemplate => inner(customTemplate, false),
    server: customTemplate => inner(customTemplate, true)
};
