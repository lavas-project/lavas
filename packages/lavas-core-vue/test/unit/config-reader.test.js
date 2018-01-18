/**
 * @file test case for ConfigReader
 * @author panyuqi (panyuqi@baidu.com)
 */

/* eslint-disable fecs-use-standard-promise */

import merge from 'webpack-merge';
import {join} from 'path';
import test from 'ava';
import LavasCore from '../../dist';
import {syncConfig} from '../utils';

let core;

test.beforeEach('init', t => {
    core = new LavasCore(join(__dirname, '../fixtures/simple'));
});

test.serial('it should merge middlewares defined in lavas.config.js and defaults correctly', async t => {
    await core.init('development', true);

    /**
     * default            all: []
     * lavas.config.js    all: ['both']
     * merged             all: ['both']
     */
    t.deepEqual(core.config.middleware.all, ['both']);
});

test.serial('it should add a new alias', async t => {
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

test.serial('it should use a extend function to modify webpack base config directly', async t => {
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

test.serial('it should use a extend function to modify webpack client config directly', async t => {
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

test.serial('it should use a extend function to modify webpack server config directly', async t => {
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

test.serial('it should use another config when user has explictly set', async t => {
    await core.init('development', true, {config: join(__dirname, '../fixtures/simple/lavas.another.config.js')});

    t.deepEqual(core.config.middleware.all, []);
    t.true(core.config.build.ssr);
    t.is(core.config.build.publicPath, '/lavas2/');
    t.is(core.config.router.base, '/lavas2/');
});
