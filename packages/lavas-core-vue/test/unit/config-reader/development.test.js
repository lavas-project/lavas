/**
 * @file TestCase for ConfigReader
 * @author panyuqi (panyuqi@baidu.com)
 */

/* eslint-disable fecs-use-standard-promise */

import merge from 'webpack-merge';
import {join} from 'path';
import test from 'ava';
import LavasCore from '../../../dist';
import {syncConfig} from '../../utils';

let core;

test.beforeEach('init', async t => {
    core = new LavasCore(join(__dirname, '../../fixtures/simple'));
    await core.init('development', true);
});

test('it should merge middlewares defined in lavas.config.js and defaults correctly', async t => {
    /**
     * default            all: []
     * lavas.config.js    all: ['both']
     * merged             all: ['both']
     */
    t.deepEqual(core.config.middleware.all, ['both']);
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
