/**
 * @file TestCase for ConfigReader in production mode
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/* eslint-disable fecs-use-standard-promise */

import {join} from 'path';
import test from 'ava';
import {copy, remove} from 'fs-extra';
import LavasCore from '../../../core';

import {syncConfig, makeTempDir} from '../../utils';

test.beforeEach('init lavas-core & server', async t => {
    // copy fixture to temp dir
    let tempDir = await makeTempDir();
    console.log(tempDir, 'created')
    await copy(join(__dirname, '../../fixtures/simple'), tempDir);

    t.context.tempDir = tempDir;
    t.context.core = new LavasCore(tempDir);
});

test.afterEach.always('clean', async t => {
    let {core, tempDir} = t.context;

    await core.close();
    // clean temp dir
    await remove(tempDir);
    console.log(tempDir, 'deleted')
});

test('it should read from config.json after building', async t => {
    let {core, tempDir} = t.context;
    await core.init('production', true);

    // disable stats
    core.config.build.stats = false;
    syncConfig(core, core.config);
    await core.build();

    core = new LavasCore(join(tempDir, 'dist'));
    await core.init('production');

    t.deepEqual(core.config.middleware.all, ['both']);
    t.true(core.config.build.ssr);
    t.is(core.config.router.base, '/');
    t.is(core.config.errorHandler.errorPath, '/error');

    t.context.core = core;
});
/* eslint-enable fecs-use-standard-promise */
