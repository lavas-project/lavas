/**
 * @file TestCase for utils/workbox.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import test from 'ava';
import {join} from 'path';
import {readFile} from 'fs-extra';
import merge from 'webpack-merge';
import {getWorkboxFiles, useWorkbox} from '../../../dist/utils/workbox';
import {syncConfig} from '../../utils';
import LavasCore from '../../../dist';

test.beforeEach('init', async t => {
    let core = new LavasCore(join(__dirname, '../../fixtures/simple'));
    await core.init('production', true);
});

test('it should get workbox files correctly', t => {
    let devFiles = getWorkboxFiles(false);
    t.deepEqual(devFiles, ['workbox-sw.dev.v2.1.2.js', 'workbox-sw.dev.v2.1.2.js.map']);

    let prodFiles = getWorkboxFiles(true);
    t.deepEqual(prodFiles, ['workbox-sw.prod.v2.1.2.js', 'workbox-sw.prod.v2.1.2.js.map']);
});

test('it should generate service-worker.js correctly in SSR mode', async t => {
    let config = merge(core.config, {
        build: {
            ssr: true
        },
        serviceWorker: {
            appshellUrl: '/appshell'
        }
    });
    syncConfig(core, config);
    await core.build();

    let swContent = await readFile(join(__dirname, '../../fixtures/simple/dist/service-worker.js'));

    t.true(swContent.indexOf('importScripts(\'/static/js/workbox-sw.prod.v2.1.2.js\');') !== -1);
    t.true(swContent.indexOf('workboxSW.router.registerNavigationRoute(\'/appshell\');') !== -1);
});
