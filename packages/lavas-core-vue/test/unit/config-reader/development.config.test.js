/**
 * @file TestCase for ConfigReader with config parameter
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

test('it should use another config when user has explictly set', async t => {
    let {core, tempDir} = t.context;
    await core.init('development', true, {config: join(tempDir, 'lavas.another.config.js')});

    t.deepEqual(core.config.middleware.all, []);
    t.true(!core.config.build.ssr);
    t.is(core.config.build.publicPath, '/lavas2/');
    t.is(core.config.router.base, '/lavas2/');
});
/* eslint-enable fecs-use-standard-promise */
