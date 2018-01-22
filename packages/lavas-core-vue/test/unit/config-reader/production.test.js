/**
 * @file TestCase for ConfigReader in production mode
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/* eslint-disable fecs-use-standard-promise */

import {join} from 'path';
import test from 'ava';
import {rename} from 'fs-extra';
import LavasCore from '../../../dist';

test('it should read from config.json after building', async t => {
    let core = new LavasCore(join(__dirname, '../../fixtures/simple'));
    await core.init('production', true);
    await core.build();

    core = new LavasCore(join(__dirname, '../../fixtures/simple/dist'));
    await core.init('production');

    t.deepEqual(core.config.middleware.all, ['both']);
    t.true(core.config.build.ssr);
    t.is(core.config.router.base, '/');
    t.is(core.config.errorHandler.errorPath, '/error');
});
/* eslint-enable fecs-use-standard-promise */
