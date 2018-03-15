/**
 * @file TestCase for utils/workbox.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import test from 'ava';
import {join} from 'path';
import {readFile, writeFile, copy, remove} from 'fs-extra';
import merge from 'webpack-merge';
import {getWorkboxFiles} from '../../../core/utils/workbox';
import {syncConfig, makeTempDir} from '../../utils';
import LavasCore from '../../../core';

test.beforeEach('init lavas-core & server', async t => {
    // copy fixture to temp dir
    let tempDir = await makeTempDir();
    await copy(join(__dirname, '../../fixtures/simple'), tempDir);

    t.context.tempDir = tempDir;
    let core = new LavasCore(tempDir);
    await core.init('production', true);

    // disable stats
    core.config.build.stats = false;
    syncConfig(core, core.config);

    t.context.core = core;
});

test.afterEach.always('clean', async t => {
    let {core, tempDir} = t.context;

    await core.close();
    // clean temp dir
    await remove(tempDir);
});

// test('it should get workbox files', t => {
//     let devFiles = getWorkboxFiles(false);
//     t.true(devFiles.length === 2);
//     t.is('workbox-sw.js', devFiles[0]);
//     t.is('workbox-sw.js.map', devFiles[1]);

//     let prodFiles = getWorkboxFiles(true);
//     t.true(prodFiles.length === 2);
//     t.is('workbox-sw.js', devFiles[0]);
//     t.is('workbox-sw.js.map', devFiles[1]);
// });

// test('it should generate service-worker.js in SSR mode', async t => {
//     let {core, tempDir} = t.context;
//     await core.build();

//     let swContent = await readFile(join(tempDir, 'dist/service-worker.js'), 'utf8');

//     t.true(swContent.indexOf('importScripts(\'/static/js/workbox-sw.prod') !== -1);
//     t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/appshell\');') !== -1);
// });

// test('it should generate service-worker.js in SSR mode with appshellUrls', async t => {
//     let {core, tempDir} = t.context;
//     delete core.config.serviceWorker.appshellUrl;
//     let config = merge(core.config, {
//         build: {
//             ssr: true
//         },
//         serviceWorker: {
//             appshellUrls: ['/use-appshell-urls']
//         }
//     });
//     syncConfig(core, config);
//     await core.build();

//     let swContent = await readFile(join(tempDir, 'dist/service-worker.js'), 'utf8');

//     t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/use-appshell-urls\');') !== -1);
// });

// test('it should generate service-worker.js in SSR mode with baseUrl', async t => {
//     let {core, tempDir} = t.context;
//     delete core.config.serviceWorker.appshellUrls;
//     let config = merge(core.config, {
//         build: {
//             ssr: true
//         },
//         router: {
//             base: '/some-base/'
//         },
//         serviceWorker: {
//             appshellUrl: '/appshell'
//         }
//     });
//     syncConfig(core, config);
//     await core.build();

//     let swContent = await readFile(join(tempDir, 'dist/service-worker.js'), 'utf8');

//     t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/some-base/appshell\');') !== -1);
// });

// test('it should generate service-worker.js in SSR mode with invalid config', async t => {
//     let {core, tempDir} = t.context;
//     let config = merge(core.config, {
//         build: {
//             ssr: true
//         },
//         router: {
//             base: '/base-without-slash'
//         },
//         serviceWorker: {
//             appshellUrl: 'appshell-without-slash'
//         }
//     });
//     syncConfig(core, config);
//     await core.build();

//     let swContent = await readFile(join(tempDir, 'dist/service-worker.js'), 'utf8');

//     t.true(swContent.indexOf(
//         'workboxSW.router.registerNavigationRoute(\'/base-without-slash/appshell-without-slash\');'
//     ) !== -1);
// });

// test('it should generate service-worker.js in SSR mode without appshellUrl', async t => {
//     let {core, tempDir} = t.context;
//     delete core.config.serviceWorker.appshellUrl;
//     await core.build();

//     let swContent = await readFile(join(tempDir, 'dist/service-worker.js'), 'utf8');

//     t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute') === -1);
// });

test('it should generate service-worker.js in SPA mode', async t => {
    let {core, tempDir} = t.context;
    let config = merge(core.config, {
        build: {
            ssr: false
        }
    });
    syncConfig(core, config);
    await core.build();

    let swContent = await readFile(join(tempDir, 'dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/index.html\');') !== -1);
});

// test('it should generate service-worker.js in SPA mode with baseUrl', async t => {
//     let {core, tempDir} = t.context;
//     let config = merge(core.config, {
//         build: {
//             ssr: false
//         },
//         router: {
//             base: '/some-base/'
//         }
//     });
//     syncConfig(core, config);
//     await core.build();

//     let swContent = await readFile(join(tempDir, 'dist/service-worker.js'), 'utf8');

//     t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/some-base/index.html\');') !== -1);
// });

// test('it should generate service-worker.js in SPA mode with invalid config', async t => {
//     let {core, tempDir} = t.context;
//     let config = merge(core.config, {
//         build: {
//             ssr: false
//         },
//         router: {
//             base: '/base-without-slash'
//         }
//     });
//     syncConfig(core, config);

//     let swTemplatePath = join(tempDir, 'core/service-worker.js');
//     let swTemplateContent = await readFile(swTemplatePath, 'utf8');
//     let swTemplateChangedContent = swTemplateContent.replace(
//         /workboxSW\.precache\(\[\]\);/,
//         'workboxSW.precache([ ]);'
//     );

//     await writeFile(swTemplatePath, swTemplateChangedContent, 'utf8');
//     await core.build();

//     let swContent = await readFile(join(tempDir, 'dist/service-worker.js'), 'utf8');

//     t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/base-without-slash/index.html\');') !== -1);
// });
