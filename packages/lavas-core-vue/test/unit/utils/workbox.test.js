/**
 * @file TestCase for utils/workbox.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {join} from 'path';
import {readFile, writeFile, copy, remove} from 'fs-extra';
import merge from 'webpack-merge';
import {getWorkboxFiles} from '../../../core/utils/workbox';
import {syncConfig, makeTempDir, test} from '../../utils';
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

test('it should get workbox files', t => {
    let devFiles = getWorkboxFiles(false);
    t.true(devFiles.length === 2);
    t.is('workbox-sw.js', devFiles[0]);
    t.is('workbox-sw.js.map', devFiles[1]);

    let prodFiles = getWorkboxFiles(true);
    t.true(prodFiles.length === 2);
    t.is('workbox-sw.js', devFiles[0]);
    t.is('workbox-sw.js.map', devFiles[1]);
});

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

    t.true(swContent.indexOf('workbox.routing.registerNavigationRoute(\'/index.html\');') !== -1);
});

test('it should generate service-worker.js in SPA mode with baseUrl', async t => {
    let {core, tempDir} = t.context;
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

    let swContent = await readFile(join(tempDir, 'dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf('workbox.routing.registerNavigationRoute(\'/some-base/index.html\');') !== -1);
});

test('it should generate service-worker.js in SPA mode with invalid config', async t => {
    let {core, tempDir} = t.context;
    let config = merge(core.config, {
        build: {
            ssr: false
        },
        router: {
            base: '/base-without-slash'
        }
    });
    syncConfig(core, config);
    await core.build();

    let swContent = await readFile(join(tempDir, 'dist/service-worker.js'), 'utf8');

    t.true(swContent.indexOf('workbox.routing.registerNavigationRoute(\'/base-without-slash/index.html\');') !== -1);
});
