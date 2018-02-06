/**
 * @file utils.workbox.js
 * @author lavas
 */
import {basename, join} from 'path';
import {readFileSync, writeFileSync} from 'fs-extra';
// import WorkboxWebpackPlugin from 'workbox-webpack-plugin';
import {InjectManifest} from '../plugins/workbox-webpack-plugin';

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
 * @param {?Object} entryConfig entry config (undefined when SPA and SSR)
 */
export function useWorkbox(webpackConfig, lavasConfig, entryConfig, entryNames) {
    let {buildVersion, build: {publicPath, ssr}, globals, router: {base = '/'}} = lavasConfig;
    let workboxConfig = entryConfig ? entryConfig.serviceWorker : lavasConfig.serviceWorker;
    let {swSrc, swDest = 'service-worker.js', appshellUrl, appshellUrls} = workboxConfig;

    // workbox precache inject point
    const WORKBOX_PRECACHE_REG = /workbox\.precaching\.precacheAndRoute\(self\.__precacheManifest\);/;

    // default config for workbox.InjectManifest
    let workboxInjectManifestConfig = {
        importWorkboxFrom: 'disabled',
        globDirectory: '.',
        exclude: [
            /\.map$/,
            /^manifest.*\.js(?:on)?$/,
            /\.hot-update\.js$/,
            /sw-register\.js/
        ]
    };

    // in workbox@3.x swDest must be a relative path
    swDest = basename(swDest);

    // MPA
    if (entryConfig) {
        swSrc = getEntryConfigValue(swSrc, entryConfig.name);

        // workboxConfig.swPath = getEntryConfigValue(workboxConfig.swPath, entryConfig.name);
        let manifestFilename = `${entryConfig.name}/[manifest]`;
        if (entryConfig.name === 'index') {
            manifestFilename = null;
        }
        else {
            swDest = `${entryConfig.name}/${swDest}`;
        }

        workboxConfig = Object.assign({}, workboxInjectManifestConfig, {
            manifestFilename,
            swDest,
            excludeChunks: entryNames.filter(n => n !== entryConfig.name),
            exclude: [
                ...workboxInjectManifestConfig.exclude,
                ...entryNames
                    .filter(n => n !== entryConfig.name)
                    .map(n => new RegExp(`^${n}/`))
            ]
        });
    }
    // SPA & SSR
    else {
        workboxConfig = Object.assign({}, workboxInjectManifestConfig, {
            swDest
        });
    }

    if (base !== '/' && !base.endsWith('/')) {
        base += '/';
    }

    // service-worker provided by user
    let serviceWorkerContent = readFileSync(swSrc);

    // import workbox-sw
    let {version: workboxBuildVersion} = require('workbox-build/package.json');
    let importWorkboxClause = `
        importScripts('${publicPath}static/workbox-v${workboxBuildVersion}/workbox-sw.js');

        workbox.setConfig({
            modulePathPrefix: '${publicPath}static/workbox-v${workboxBuildVersion}/'
        });
    `;
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

            registerNavigationClause = `workbox.routing.registerNavigationRoute('${appshellUrl}');`;
        }
    }
    else {
        let entryHtml = 'index.html';
        let whitelistClause = '';
        if (entryConfig) {
            entryHtml = `${entryConfig.name}/${entryConfig.name}.html`;
            if (entryConfig.name === 'index') {
                whitelistClause = ', {whitelist: [/^\\/$/]}';
            }
        }
        registerNavigationClause = `workbox.routing.registerNavigationRoute('${base}${entryHtml}'${whitelistClause});`;
    }

    if (WORKBOX_PRECACHE_REG.test(serviceWorkerContent)) {
        serviceWorkerContent = serviceWorkerContent.replace(WORKBOX_PRECACHE_REG,
            `workbox.precaching.precacheAndRoute(self.__precacheManifest);\n${registerNavigationClause}\n`);
    }
    else {
        serviceWorkerContent += registerNavigationClause;
    }

    // write new service worker in .lavas/sw.js
    let tempSwSrc = entryConfig
        ? join(globals.rootDir, './.lavas', entryConfig.name, 'sw-temp.js')
        : join(globals.rootDir, './.lavas', 'sw-temp.js');
    writeFileSync(tempSwSrc, serviceWorkerContent, 'utf8');
    workboxConfig.swSrc = tempSwSrc;

    // delete some custom props such as `swPath` and `appshellUrls`, otherwise workbox will throw an error
    delete workboxConfig.swPath;
    delete workboxConfig.appshellUrls;
    delete workboxConfig.appshellUrl;

    // use workbox-webpack-plugin@3.x
    webpackConfig.plugins.push(new InjectManifest(workboxConfig));
}

/**
 * replace [entryName] with real value
 * entries/[entryName]/service-worker.js => entries/index/service-worker.js
 *
 * @param {string} value sericeWorker config value
 * @param {string} entryName entry name
 * @return {string} real value
 */
function getEntryConfigValue(value, entryName) {
    return value ? value.replace(/\[entryName\]/g, entryName) : undefined;
}
