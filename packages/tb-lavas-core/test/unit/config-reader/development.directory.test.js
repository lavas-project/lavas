/**
 * @file TestCase for ConfigReader without lavas.config.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/* eslint-disable fecs-use-standard-promise */

import {join} from 'path';
import test from 'ava';
import {copy, remove, rename} from 'fs-extra';
import LavasCore from '../../../core';

import {syncConfig, makeTempDir} from '../../utils';

test.beforeEach('init lavas-core & server', async t => {
    // copy fixture to temp dir
    let tempDir = await makeTempDir();
    await copy(join(__dirname, '../../fixtures/simple'), tempDir);

    t.context.tempDir = tempDir;
    t.context.core = new LavasCore(tempDir);
});

test.afterEach.always('clean', async t => {
    let {core, tempDir} = t.context;

    await core.close();
    // clean temp dir
    await remove(tempDir);
});

test('it should read from config directory when lavas.config.js does not exist', async t => {
    let {core, tempDir} = t.context;
    // rename to simulate when it does not exist
    await rename(
        join(tempDir, 'lavas.config.js'),
        join(tempDir, 'lavas.config.js.bak')
    );
    await core.init('development', true);

    t.deepEqual(core.config.middleware.all, []);
    t.true(!core.config.build.ssr);
    t.is(core.config.build.publicPath, '/from-dir/');
    t.is(core.config.router.base, '/from-dir/');
    t.true(core.config.build.cssExtract);
});
/* eslint-enable fecs-use-standard-promise */
