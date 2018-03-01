/**
 * @file TestCase for utils/workbox.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import test from 'ava';
import {join} from 'path';
import {readFile, writeFile} from 'fs-extra';
import merge from 'webpack-merge';
import {getWorkboxFiles} from '../../../core/utils/workbox';
import {syncConfig} from '../../utils';
import LavasCore from '../../../core';

let core;

test.beforeEach('init', async t => {
    core = new LavasCore(join(__dirname, '../../fixtures/simple'));
    await core.init('production', true);
});

test.serial('it should get workbox files', t => {
    let devFiles = getWorkboxFiles(false);
    t.true(devFiles.length === 2);
    t.true(/^workbox-sw\.dev\.v[\d\.]+\.js$/.test(devFiles[0]));
    t.true(/^workbox-sw\.dev\.v[\d\.]+\.js\.map$/.test(devFiles[1]));

    let prodFiles = getWorkboxFiles(true);
    t.true(prodFiles.length === 2);
    t.true(/^workbox-sw\.prod\.v[\d\.]+\.js$/.test(prodFiles[0]));
    t.true(/^workbox-sw\.prod\.v[\d\.]+\.js\.map$/.test(prodFiles[1]));
});

test.serial('it should generate service-worker.js in SSR mode', async t => {
    await core.build();

    let swContent = await readFile(join(__dirname, '../../fixtures/simple/dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf('importScripts(\'/static/js/workbox-sw.prod') !== -1);
    t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/appshell\');') !== -1);
});

test.serial('it should generate service-worker.js in SSR mode with appshellUrls', async t => {
    delete core.config.serviceWorker.appshellUrl;
    let config = merge(core.config, {
        build: {
            ssr: true
        },
        serviceWorker: {
            appshellUrls: ['/use-appshell-urls']
        }
    });
    syncConfig(core, config);
    await core.build();

    let swContent = await readFile(join(__dirname, '../../fixtures/simple/dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/use-appshell-urls\');') !== -1);
});

test.serial('it should generate service-worker.js in SSR mode with baseUrl', async t => {
    delete core.config.serviceWorker.appshellUrls;
    let config = merge(core.config, {
        build: {
            ssr: true
        },
        router: {
            base: '/some-base/'
        },
        serviceWorker: {
            appshellUrl: '/appshell'
        }
    });
    syncConfig(core, config);
    await core.build();

    let swContent = await readFile(join(__dirname, '../../fixtures/simple/dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/some-base/appshell\');') !== -1);
});

test.serial('it should generate service-worker.js in SSR mode with invalid config', async t => {
    let config = merge(core.config, {
        build: {
            ssr: true
        },
        router: {
            base: '/base-without-slash'
        },
        serviceWorker: {
            appshellUrl: 'appshell-without-slash'
        }
    });
    syncConfig(core, config);
    await core.build();

    let swContent = await readFile(join(__dirname, '../../fixtures/simple/dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf(
        'workboxSW.router.registerNavigationRoute(\'/base-without-slash/appshell-without-slash\');'
    ) !== -1);
});

test.serial('it should generate service-worker.js in SSR mode without appshellUrl', async t => {
    delete core.config.serviceWorker.appshellUrl;
    await core.build();

    let swContent = await readFile(join(__dirname, '../../fixtures/simple/dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute') === -1);
});

test.serial('it should generate service-worker.js in SPA mode', async t => {
    let config = merge(core.config, {
        build: {
            ssr: false
        }
    });
    syncConfig(core, config);
    await core.build();

    let swContent = await readFile(join(__dirname, '../../fixtures/simple/dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/index.html\');') !== -1);
});

test.serial('it should generate service-worker.js in SPA mode with baseUrl', async t => {
    let config = merge(core.config, {
        build: {
            ssr: false
        },
        router: {
            base: '/some-base/'
        }
    });
    syncConfig(core, config);
    await core.build();

    let swContent = await readFile(join(__dirname, '../../fixtures/simple/dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/some-base/index.html\');') !== -1);
});

test.serial('it should generate service-worker.js in SPA mode with invalid config', async t => {
    let config = merge(core.config, {
        build: {
            ssr: false
        },
        router: {
            base: '/base-without-slash'
        }
    });
    syncConfig(core, config);

    let swTemplatePath = join(__dirname, '../../fixtures/simple/core/service-worker.js');
    let swTemplateContent = await readFile(swTemplatePath, 'utf8');
    let swTemplateChangedContent = swTemplateContent.replace(
        /workboxSW\.precache\(\[\]\);/,
        'workboxSW.precache([ ]);'
    );

    await writeFile(swTemplatePath, swTemplateChangedContent, 'utf8');
    await core.build();

    let swContent = await readFile(join(__dirname, '../../fixtures/simple/dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/base-without-slash/index.html\');') !== -1);

    await writeFile(swTemplatePath, swTemplateContent, 'utf8');
});
