/**
 * @file TestCase for ConfigReader in production mode
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/* eslint-disable fecs-use-standard-promise */

import {join} from 'path';
import LavasCore from '../../../core';
import {syncConfig, makeTempDir, test} from '../../utils';

test('it should read from config.json after building', async t => {
    let {core, tempDir} = t.context;
    await core.init('production', true);

    // disable stats
    core.config.build.stats = false;
    syncConfig(core, core.config);
    await core.build();
    // core = new LavasCore(join(tempDir, 'dist'));
    // await core.init('production');

    t.deepEqual(core.config.middleware.all, ['both']);
    t.true(core.config.build.ssr);
    t.is(core.config.router.base, '/');
    t.is(core.config.errorHandler.errorPath, '/error');

    t.context.core = core;
});
/* eslint-enable fecs-use-standard-promise */
