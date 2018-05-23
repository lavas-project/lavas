/**
 * @file TestCase for ConfigReader
 * @author panyuqi (panyuqi@baidu.com)
 */

/* eslint-disable fecs-use-standard-promise */

import merge from 'webpack-merge';
import {join} from 'path';
import {syncConfig, makeTempDir, test} from '../../utils';


test('it should merge middlewares defined in lavas.config.js and defaults correctly', async t => {
    let core = t.context.core;
    await core.init('development', true);
    core.builder.reloadClient();
    core.builder.startRebuild();
    /**
     * default            all: []
     * lavas.config.js    all: ['both']
     * merged             all: ['both']
     */
    await core.build();
    t.deepEqual(core.config.middleware.all, ['both']);
});

test('it should add a new alias', async t => {
    let core = t.context.core;
    await core.init('development', true);
    let config = merge(core.config, {
        build: {
            alias: {
                base: {
                    '~~': 'some-path'
                }
            }
        }
    });
    syncConfig(core, config);
    let baseConfig = core.builder.webpackConfig.base();
    t.is(baseConfig.resolve.alias['~~'], 'some-path');
});

test('it should use a extend function to modify webpack base config directly', async t => {
    let core = t.context.core;
    await core.init('development', true);
    let config = merge(core.config, {
        build: {
            extend(webpackConfig, {type}) {
                if (type === 'base') {
                    webpackConfig.plugins.push('NewCustomPlugin');
                }
            }
        }
    });

    syncConfig(core, config);

    let baseConfig = core.builder.webpackConfig.base();
    t.is(baseConfig.plugins[baseConfig.plugins.length - 1], 'NewCustomPlugin');
});

test('it should use a extend function to modify webpack client config directly', async t => {
    let core = t.context.core;
    await core.init('development', true);
    let config = merge(core.config, {
        build: {
            extend(webpackConfig, {type}) {
                if (type === 'client') {
                    webpackConfig.plugins.push('NewClientCustomPlugin');
                }
            }
        }
    });

    syncConfig(core, config);

    let clientConfig = core.builder.webpackConfig.client();
    t.is(clientConfig.plugins[clientConfig.plugins.length - 1], 'NewClientCustomPlugin');
});

test('it should use a extend function to modify webpack server config directly', async t => {
    let core = t.context.core;
    await core.init('development', true);
    let config = merge(core.config, {
        build: {
            extend(webpackConfig, {type}) {
                if (type === 'server') {
                    webpackConfig.plugins.push('NewServerCustomPlugin');
                }
            }
        }
    });

    syncConfig(core, config);

    let serverConfig = core.builder.webpackConfig.server(config);
    t.is(serverConfig.plugins[serverConfig.plugins.length - 1], 'NewServerCustomPlugin');
});
/* eslint-enable fecs-use-standard-promise */
