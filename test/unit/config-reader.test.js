/**
 * @file test case for ConfigReader
 * @author panyuqi (panyuqi@baidu.com)
 */

/* eslint-disable fecs-use-standard-promise */

import merge from 'webpack-merge';
import {join} from 'path';
import test from 'ava';
import LavasCore from '../../dist/core';
import {syncConfig} from '../utils';

let core;

test.beforeEach('init', async t => {
    core = new LavasCore(join(__dirname, '../fixtures'));
    await core.init('development', true);
});

test('it should merge middlewares defined in lavas.config.js and defaults correctly', t => {
    /**
     * default            all: []
     * lavas.config.js    all: ['middleware1', 'middleware2']
     * merged             all: ['middleware1', 'middleware2']
     */
    t.deepEqual(core.config.middleware.all, ['middleware1', 'middleware2']);
});

test('it should add a new alias', async t => {
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
    t.is(baseConfig.plugins.length, 2);
    t.is(baseConfig.plugins[1], 'NewCustomPlugin');
});

test('it should use a extend function to modify webpack client config directly', async t => {
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
