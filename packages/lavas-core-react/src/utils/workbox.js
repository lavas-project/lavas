/**
 * @file utils.workbox.js
 * @author lavas
 */
import {basename, join} from 'path';
import {readFileSync, writeFileSync} from 'fs-extra';
import WorkboxWebpackPlugin from 'workbox-webpack-plugin';

export const WORKBOX_PATH = require.resolve('workbox-sw');

/**
 * get workbox files
 *
 * @param {boolean} isProd is in production mode
 * @return {Array} files .js & .map
 */
export function getWorkboxFiles(isProd) {
    let filename = isProd
        ? basename(WORKBOX_PATH) : basename(WORKBOX_PATH).replace('prod', 'dev');
    return [
        filename,
        `${filename}.map`
    ];
}

/**
 * use workbox-webpack-plugin
 *
 * @param {Object} webpackConfig webpack config
 * @param {Object} lavasConfig lavas config
 */
export function useWorkbox(webpackConfig, lavasConfig) {
    let {
        buildVersion,
        build: {publicPath, ssr},
        globals,
        router: {base = '/'},
        serviceWorker: workboxConfig
    } = lavasConfig;
    let {swSrc, appshellUrl, appshellUrls} = workboxConfig;

    if (base !== '/' && !base.endsWith('/')) {
        base += '/';
    }

    // service-worker provided by user
    let serviceWorkerContent = readFileSync(swSrc);

    // import workbox-sw
    let importWorkboxClause = `importScripts('${publicPath}static/js/${getWorkboxFiles(true)[0]}');`;
    serviceWorkerContent = importWorkboxClause + serviceWorkerContent;

    // register navigation in the end
    let registerNavigationClause;
    if (ssr) {

        // be compatible with previous version
        if (appshellUrls && appshellUrls.length) {
            appshellUrl = appshellUrls[0];
        }

        // add build version to templatedUrls and set register clause
        if (appshellUrl) {
            // add router base
            if (base !== '/') {
                if (appshellUrl.startsWith('/')) {
                    appshellUrl = appshellUrl.substring(1, appshellUrl.length);
                }
                appshellUrl = base + appshellUrl;
            }

            workboxConfig.templatedUrls = {
                [appshellUrl]: `${buildVersion}`
            };

            registerNavigationClause = `workboxSW.router.registerNavigationRoute('${appshellUrl}');`;
        }
    }
    else {
        registerNavigationClause = `workboxSW.router.registerNavigationRoute('${base}index.html');`;
    }

    if (!/workboxSW\.router\.registerNavigationRoute/.test(serviceWorkerContent)) {
        if (/workboxSW\.precache\(\[\]\);/.test(serviceWorkerContent)) {
            serviceWorkerContent = serviceWorkerContent.replace(/workboxSW\.precache\(\[\]\);/,
                `workboxSW.precache([]);\n${registerNavigationClause}\n`);
        }
        else {
            serviceWorkerContent += registerNavigationClause;
        }
    }


    // write new service worker in .lavas/sw.js
    let tempSwSrc = join(globals.rootDir, './.lavas', 'sw-temp.js');
    writeFileSync(tempSwSrc, serviceWorkerContent, 'utf8');
    workboxConfig.swSrc = tempSwSrc;

    // use workbox-webpack-plugin@2.x
    webpackConfig.plugin('workbox').use(WorkboxWebpackPlugin, [workboxConfig]);
}
