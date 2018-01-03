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
 * @param {Object} workboxConfig workbox config
 * @param {Object} lavasConfig lavas config
 */
export function useWorkbox(webpackConfig, workboxConfig, lavasConfig) {
    let {swSrc, appshellUrl} = workboxConfig;
    let {buildVersion, build: {publicPath, ssr}, globals} = lavasConfig;

    // service-worker provided by user
    let serviceWorkerContent = readFileSync(swSrc);

    // import workbox-sw
    let importWorkboxClause = `importScripts('${publicPath}static/js/workbox-sw.prod.v2.1.2.js');`;
    serviceWorkerContent = importWorkboxClause + serviceWorkerContent;

    // register navigation in the end
    let registerNavigationClause;
    if (ssr) {
        registerNavigationClause = `workboxSW.router.registerNavigationRoute('${appshellUrl}');`;

        // add build version to templatedUrls
        if (appshellUrl) {
            workboxConfig.templatedUrls = {
                [appshellUrl]: `${buildVersion}`
            };
        }
    }
    else {
        registerNavigationClause = `workboxSW.router.registerNavigationRoute('/index.html');`;
    }
    serviceWorkerContent += registerNavigationClause;

    // write new service worker in .lavas/sw.js
    let tempSwSrc = join(globals.rootDir, './.lavas', 'sw-temp.js');
    writeFileSync(tempSwSrc, serviceWorkerContent, 'utf8');
    workboxConfig.swSrc = tempSwSrc;

    // use workbox-webpack-plugin@2.x
    webpackConfig.plugins.push(new WorkboxWebpackPlugin(workboxConfig));
}
