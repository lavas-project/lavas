/**
 * @file TestCase for ConfigReader without lavas.config.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/* eslint-disable fecs-use-standard-promise */

import {join} from 'path';
import test from 'ava';
import {rename} from 'fs-extra';
import LavasCore from '../../../dist';

test('it should read from config directory when lavas.config.js does not exist', async t => {
    // rename to simulate when it does not exist
    await rename(
        join(__dirname, '../../fixtures/simple/lavas.config.js'),
        join(__dirname, '../../fixtures/simple/lavas.config.js.bak')
    );
    let core = new LavasCore(join(__dirname, '../../fixtures/simple'));
    await core.init('development', true);

    t.deepEqual(core.config.middleware.all, []);
    t.true(!core.config.build.ssr);
    t.is(core.config.build.publicPath, '/from-dir/');
    t.is(core.config.router.base, '/from-dir/');
    t.true(core.config.build.cssExtract);

    // resume
    await rename(
        join(__dirname, '../../fixtures/simple/lavas.config.js.bak'),
        join(__dirname, '../../fixtures/simple/lavas.config.js')
    );
});
/* eslint-enable fecs-use-standard-promise */
