/**
 * @file TestCase for ConfigReader
 * @author panyuqi (panyuqi@baidu.com)
 */

/* eslint-disable fecs-use-standard-promise */

import merge from 'webpack-merge';
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

test('it should merge middlewares defined in lavas.config.js and defaults correctly', async t => {
    let core = t.context.core;
    await core.init('development', true);
    /**
     * default            all: []
     * lavas.config.js    all: ['both']
     * merged             all: ['both']
     */
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
    let baseConfig = await core.builder.webpackConfig.base();
    t.is(baseConfig.resolve.alias.get('~~'), 'some-path');
});

class FirstNewPlugin {
    constructor() {
        this.name = 'FirstNewPlugin';
    }
}
class SecondNewPlugin {
    constructor() {
        this.name = 'SecondNewPlugin';
    }
}

test('it should use a extend function to modify webpack client config directly', async t => {
    let core = t.context.core;
    await core.init('development', true);
    let config = merge(core.config, {
        build: {
            extend(webpackConfig, {type}) {
                if (type === 'client') {
                    webpackConfig.plugins.push(new SecondNewPlugin());
                }
            },
            extendWithWebpackChain(config, {type}) {
                config.plugin('first-new-plugin').use(FirstNewPlugin);
            }
        }
    });

    syncConfig(core, config);

    let clientConfig = await core.builder.webpackConfig.client(config);
    t.is(clientConfig.plugins[clientConfig.plugins.length - 1].name, 'SecondNewPlugin');
    t.is(clientConfig.plugins[clientConfig.plugins.length - 2].name, 'FirstNewPlugin');
});

test('it should use a extend function to modify webpack server config directly', async t => {
    let core = t.context.core;
    await core.init('development', true);
    let config = merge(core.config, {
        build: {
            extend(webpackConfig, {type}) {
                if (type === 'server') {
                    webpackConfig.plugins.push(new SecondNewPlugin());
                }
            },
            extendWithWebpackChain(config, {type}) {
                config.plugin('first-new-plugin').use(FirstNewPlugin);
            }
        }
    });

    syncConfig(core, config);

    let serverConfig = await core.builder.webpackConfig.server(config);
    t.is(serverConfig.plugins[serverConfig.plugins.length - 1].name, 'SecondNewPlugin');
    t.is(serverConfig.plugins[serverConfig.plugins.length - 2].name, 'FirstNewPlugin');
});
/* eslint-enable fecs-use-standard-promise */
