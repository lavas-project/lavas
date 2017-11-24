/**
 * @file test case for config loader
 * @author panyuqi (pyqiverson@gmail.com)
 */

/* eslint-disable fecs-use-standard-promise */

import merge from 'webpack-merge';
import {join, resolve} from 'path';
import test from 'ava';
import LavasCore from '../../lib';

let core;

test.beforeEach('init', async t => {
    core = new LavasCore(join(__dirname, '../fixtures'));
    core.env = 'development';
    core._init(true);
});

test('it should add a new alias', async t => {
    let config = merge(core.config, {
        webpack: {
            base: {
                resolve: {
                    alias: {
                        '~~': 'some-path'
                    }
                }
            }
        }
    });
    let baseConfig = core.webpackConfig.base(config);
    t.is(baseConfig.resolve.alias['~~'], 'some-path');
});

test('it should use "prepend" strategy to merge webpack config', async t => {
    // prepend custom plugin
    let config = merge(core.config, {
        webpack: {
            base: {
                plugins: ['CustomPlugin']
            },
            mergeStrategy: {
                plugins: 'prepend'
            }
        }
    });

    let baseConfig = core.webpackConfig.base(config);

    t.is(baseConfig.plugins.length, 2);
    t.is(baseConfig.plugins[0], 'CustomPlugin');
});

test('it should use "replace" strategy to merge webpack config', async t => {
    // replace with custom plugin
    let config = merge(core.config, {
        webpack: {
            base: {
                plugins: ['CustomPlugin']
            },
            mergeStrategy: {
                plugins: 'replace'
            }
        }
    });

    let baseConfig = core.webpackConfig.base(config);
    t.is(baseConfig.plugins.length, 1);
    t.is(baseConfig.plugins[0], 'CustomPlugin');
});

test('it should use a extend function to modify webpack base config directly', async t => {
    let config = merge(core.config, {
        webpack: {
            extend(webpackConfig, {type}) {
                if (type === 'base') {
                    webpackConfig.plugins.push('NewCustomPlugin');
                }
            }
        }
    });
    let baseConfig = core.webpackConfig.base(config);
    t.is(baseConfig.plugins.length, 2);
    t.is(baseConfig.plugins[1], 'NewCustomPlugin');
});

test('it should use a extend function to modify webpack client config directly', async t => {
    let config = merge(core.config, {
        webpack: {
            extend(webpackConfig, {type}) {
                if (type === 'client') {
                    webpackConfig.plugins.push('NewClientCustomPlugin');
                }
            }
        }
    });

    let clientConfig = core.webpackConfig.client(config);

    t.is(clientConfig.plugins[clientConfig.plugins.length - 1], 'NewClientCustomPlugin');
});

test('it should use a extend function to modify webpack server config directly', async t => {
    let config = merge(core.config, {
        webpack: {
            extend(webpackConfig, {type}) {
                if (type === 'server') {
                    webpackConfig.plugins.push('NewServerCustomPlugin');
                }
            }
        }
    });

    let serverConfig = core.webpackConfig.server(config);

    t.is(serverConfig.plugins[serverConfig.plugins.length - 1], 'NewServerCustomPlugin');
});
