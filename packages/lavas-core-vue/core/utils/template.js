/**
 * @file utils.template.js
 * 处理前后端模板统一 (SSR & SPA)
 * @author lavas
 */

import template from 'lodash.template';
import fs from 'fs-extra';
import path from 'path';

const serverTemplatePath = fs.readFileSync(path.resolve(__dirname, '../templates/server.html.tmpl'));
const clientTemplatePath = fs.readFileSync(path.resolve(__dirname, '../templates/client.html.tmpl'));

function inner(customTemplate, ssr, baseUrl) {
    let isDeprecated = /<%=\s*(render|useCustomOnly|baseUrl)/.test(customTemplate);

    if (!isDeprecated) {
        return template(customTemplate)({ssr}).replace(/<</g, '<%').replace(/>>/g, '%>');
    }

    console.log('[Lavas] core/index.html.tmpl deprecated! '
        + 'See https://lavas.baidu.com/guide/v2/advanced/core#indexhtmltmpl for more infomation');
    let templatePath = ssr ? serverTemplatePath : clientTemplatePath;
    let useCustomOnlyFlag = false;
    let renderMetaFlag = false;
    let renderManifestFlag = false;
    let renderEntryFlag = false;

    let temp = template(customTemplate)({
        useCustomOnly() {
            useCustomOnlyFlag = true;
            return '';
        },
        baseUrl,
        renderMeta() {
            renderMetaFlag = true;
            return '';
        },
        renderManifest() {
            renderManifestFlag = true;
            return '';
        },
        renderEntry() {
            renderEntryFlag = true;
            return '@RENDER_ENTRY@';
        }
    });

    if (useCustomOnlyFlag) {
        return temp;
    }

    // render server/client template with flags
    let real = template(templatePath)({
        renderMetaFlag,
        renderManifestFlag
    });

    // replace custom content into result
    let customHead = '';
    let customBodyBefore = '';
    let customBodyAfter = '';
    try {
        customHead = temp.match(/<head>([\w\W]+)<\/head>/)[1];
        if (renderEntryFlag) {
            customBodyBefore = temp.match(/<body>([\w\W]+)@RENDER_ENTRY@/)[1];
            customBodyAfter = temp.match(/@RENDER_ENTRY@([\w\W]+)<\/body>/)[1];
        }
    }
    catch (e) {
        // do nothing
    }

    real = real.replace('<!-- @CUSTOM_HEAD@ -->', customHead);
    real = real.replace('<!-- @CUSTOM_BODY_BEFORE@ -->', customBodyBefore);
    real = real.replace('<!-- @CUSTOM_BODY_AFTER@ -->', customBodyAfter);

    return real;
}

export default {
    client: (customTemplate, baseUrl) => inner(customTemplate, false, baseUrl),
    server: (customTemplate, baseUrl) => inner(customTemplate, true, baseUrl)
};
