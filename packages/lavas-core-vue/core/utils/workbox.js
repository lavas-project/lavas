/**
 * @file utils.workbox.js
 * @author lavas
 */
import {basename, join} from 'path';
import {readFileSync, writeFileSync} from 'fs-extra';
import {InjectManifest} from 'workbox-webpack-plugin';
import Logger from './logger';

/**
 * get workbox files
 *
 * @param {boolean} isProd is in production mode
 * @return {Array} files .js & .map
 */

/**
 * use workbox-webpack-plugin
 *
 * @param {Object} webpackConfig webpack config
 * @param {Object} lavasConfig lavas config
 */
export function useWorkbox(webpackConfig, lavasConfig) {
    let {
        buildVersion,
        build: {publicPath, ssr, path: buildPath},
        globals,
        router: {base = '/'},
        serviceWorker: workboxConfig
    } = lavasConfig;
    let {swSrc,
        swDest = 'service-worker.js',
        appshellUrl,
        appshellUrls,
        disableGenerateNavigationRoute = false
    } = workboxConfig;

    // default config for workbox.InjectManifest
    let workboxInjectManifestConfig = {
        importWorkboxFrom: 'disabled',
        exclude: [
            /\.map$/,
            /^manifest.*\.js(?:on)?$/,
            /\.hot-update\.js$/,
            /sw-register\.js/
        ]
    };
    // swDest must be a relative path in workbox 3.x
    swDest = basename(swDest)
    workboxConfig = Object.assign({}, workboxConfig, workboxInjectManifestConfig, {
        swDest
    })

    if (base !== '/' && !base.endsWith('/')) {
        base += '/';
    }

    // service-worker provided by user
    let serviceWorkerContent = readFileSync(swSrc);
    if (serviceWorkerContent.indexOf('new WorkboxSW') !== -1) {
        Logger.warn('build', '检测到您还在使用 workbox 2.x 的模板语法')
        Logger.warn('build', 'lavas-core-vue 从 1.2.0 版本开始已经升级为 workbox3')
        Logger.warn('build', '为了防止编译错误，当前已经关闭了 Service Worker 功能。\n')
        Logger.warn('build', '如果您想升级到 workbox3, 可以查阅 https://github.com/lavas-project/lavas/issues/188 获取升级指南')
        Logger.warn('build', '如果您想继续使用 workbox2，可以将 lavas-core-vue 的版本固定在 1.1.13。\n');
        lavasConfig.serviceWorker.enable = false
        return;
    }

    // import workbox-sw
    let {version: workboxBuildVersion} = require('workbox-build/package.json');
    let importWorkboxClause = `
        importScripts('${publicPath}static/workbox-v${workboxBuildVersion}/workbox-sw.js');
        workbox.setConfig({
            modulePathPrefix: '${publicPath}static/workbox-v${workboxBuildVersion}/'
        });
    `;
    serviceWorkerContent = importWorkboxClause + serviceWorkerContent;

    if (!disableGenerateNavigationRoute) {
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

                registerNavigationClause = `workbox.routing.registerNavigationRoute('${appshellUrl}');`;
            }
        }
        else {
            // https://github.com/lavas-project/lavas/issues/128
            registerNavigationClause = `workbox.routing.registerNavigationRoute('${publicPath}index.html');`;
        }

        // workbox precache inject point
        const WORKBOX_PRECACHE_REG = /workbox\.precaching\.precacheAndRoute\(self\.__precacheManifest\);/;
        if (WORKBOX_PRECACHE_REG.test(serviceWorkerContent)) {
            serviceWorkerContent = serviceWorkerContent.replace(WORKBOX_PRECACHE_REG,
                `workbox.precaching.precacheAndRoute(self.__precacheManifest);\n${registerNavigationClause}\n`);
        }
        else {
            serviceWorkerContent += registerNavigationClause;
        }
    }

    // write new service worker in .lavas/sw.js
    let tempSwSrc = join(globals.rootDir, './.lavas', 'sw-temp.js');
    writeFileSync(tempSwSrc, serviceWorkerContent, 'utf8');
    workboxConfig.swSrc = tempSwSrc;

    // delete some custom props such as `swPath` and `appshellUrls`, otherwise workbox will throw an error
    delete workboxConfig.enable;
    delete workboxConfig.swPath;
    delete workboxConfig.appshellUrls;
    delete workboxConfig.appshellUrl;
    delete workboxConfig.pathPrefix;
    delete workboxConfig.swName;
    delete workboxConfig.swRegisterName;
    delete workboxConfig.scope;
    delete workboxConfig.disableGenerateNavigationRoute;

    // use workbox-webpack-plugin@3.x
    webpackConfig.plugin('workbox').use(InjectManifest, [workboxConfig]).after('html');
}
