/**
 * @file TestCase for ConfigReader with config parameter
 * @author wangyisheng@baidu.com (wangyisheng)
 */

/* eslint-disable fecs-use-standard-promise */

import {join} from 'path';

import {syncConfig, makeTempDir, test} from '../../utils';


test('it should use another config when user has explictly set', async t => {
    let {core, tempDir} = t.context;
    await core.init('development', true, {config: join(tempDir, 'lavas.another.config.js')});

    t.deepEqual(core.config.middleware.all, []);
    t.true(!core.config.build.ssr);
    t.is(core.config.build.publicPath, '/lavas2/');
    t.is(core.config.router.base, '/lavas2/');
});
/* eslint-enable fecs-use-standard-promise */
