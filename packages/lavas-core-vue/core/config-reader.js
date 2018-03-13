/**
 * @file ConfigReader
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import { readFile, pathExists } from 'fs-extra';
import { join } from 'path';
import glob from 'glob';
import { merge, isArray } from 'lodash';
import { CONFIG_FILE, LAVAS_CONFIG_FILE, ENTRY_DIRNAME } from './constants';
import { distLavasPath } from './utils/path';
import * as JsonUtil from './utils/json';

function mergeArray(a, b) {
    if (isArray(a)) {
        return a.concat(b);
    }
}

const DEFAULT_CONFIG = {
    buildVersion: null,
    build: {
        ssr: true,
        publicPath: '/',
        filenames: {
            entry: 'js/[name]/[name].[chunkhash:8].js',
            vendor: 'js/lib/vendor.[chunkhash:8].js',
            vue: 'js/lib/vue.[chunkhash:8].js',
            chunk: 'js/[name]/[name].[chunkhash:8].js',
            css: 'css/[name]/[name].[contenthash:8].css',
            img: 'img/[name].[hash:8].[ext]',
            fonts: 'fonts/[name].[hash:8].[ext]'
        },
        babel: {
            presets: ['vue-app'],
            babelrc: false
        },
        cssExtract: false,
        cssMinimize: true,
        cssSourceMap: true,
        jsSourceMap: true,
        bundleAnalyzerReport: false,
        compress: false,
        defines: {
            base: {},
            client: {},
            server: {}
        },
        alias: {
            base: {},
            client: {},
            server: {}
        },
        plugins: {
            base: [],
            client: [],
            server: []
        },
        nodeExternalsWhitelist: [],
        watch: null,
        extend: null,
        ssrCopy: []
    },
    skeleton: {
        enable: true
    },
    router: {},
    errorHandler: {
        errorPath: '/error'
    },
    middleware: {
        all: [],
        server: [],
        client: []
    },
    entries: [],
    serviceWorker: null,
    production: {
        build: {
            cssExtract: true,
            compress: true
        }
    },
    development: {
        build: {
            filenames: {
                entry: 'js/[name].[hash:8].js'
            },
            babel: {
                cacheDirectory: true
            }
        }
    }
};

/**
 * config items used in runtime
 */
export const RUMTIME_ITEMS = {
    buildVersion: true,
    build: {
        ssr: true,
        publicPath: true,
        compress: true
    },
    middleware: true,
    router: true,
    errorHandler: true,
    serviceWorker: {
        swDest: true
    },
    entries: {
        name: true,
        router: true,
        urlReg: true,
        serviceWorker: {
            swDest: true
        }
    }
};

export default class ConfigReader {
    constructor(cwd, env, customConfigPath) {
        this.cwd = cwd;
        this.env = env;
        // fix https://github.com/lavas-project/lavas/issues/50
        if (customConfigPath !== 'dev') {
            this.customConfigPath = customConfigPath;
        }
    }

    mergeEnv(config) {
        if (config[this.env]) {
            merge(config, config[this.env], mergeArray);
        }
    }

    /**
     * generate a config object according to config directory and NODE_ENV
     *
     * @return {Object} config
     */
    async read() {
        let config = {};

        // merge with default options
        merge(config, DEFAULT_CONFIG, {
            globals: {
                rootDir: this.cwd
            },
            buildVersion: Date.now()
        }, mergeArray);

        this.mergeEnv(config);

        // read from custom config
        if (this.customConfigPath) {
            console.log(`[Lavas] use custom config: ${this.customConfigPath}`);
            delete require.cache[require.resolve(this.customConfigPath)];

            let customConfig = await
            import (this.customConfigPath);
            this.mergeEnv(customConfig)
            merge(config, customConfig, mergeArray);

            return this.processEntryConfig(config);
        }

        // read from lavas.config.js
        let singleConfigPath = join(this.cwd, LAVAS_CONFIG_FILE);
        if (await pathExists(singleConfigPath)) {
            console.log('[Lavas] read lavas.config.js.');
            delete require.cache[require.resolve(singleConfigPath)];

            let singleConfig = await
            import (singleConfigPath);
            this.mergeEnv(singleConfig);
            merge(config, singleConfig, mergeArray);

            return this.processEntryConfig(config);
        }

        // read from config/
        console.log('[Lavas] config directory is deprecated! Try to use lavas.config.js instead.');
        let configDir = join(this.cwd, 'config');
        let files = glob.sync(
            '**/*.js', {
                cwd: configDir
            }
        );

        // require all files and assign them to config recursively
        await Promise.all(files.map(async filepath => {
            filepath = filepath.substring(0, filepath.length - 3);

            let paths = filepath.split('/');

            let name;
            let cur = config;
            for (let i = 0; i < paths.length - 1; i++) {
                name = paths[i];
                if (!cur[name]) {
                    cur[name] = {};
                }

                cur = cur[name];
            }

            name = paths.pop();

            // load config, delete cache first
            let configPath = join(configDir, filepath);
            delete require.cache[require.resolve(configPath)];
            let exportContent = await
            import (configPath);
            cur[name] = typeof exportContent === 'object' && exportContent !== null ?
                merge(cur[name], exportContent, mergeArray) : exportContent;
        }));

        this.mergeEnv(config);

        return this.processEntryConfig(config);
    }

    /**
     * merge general default config
     *
     * @param {Object} config config
     * @return {Object} config after merge
     */
    async processEntryConfig(config) {
        let entryDirPath = join(this.cwd, ENTRY_DIRNAME);
        let hasEntries = await pathExists(entryDirPath);

        if (hasEntries) {
            let entryConfigDirs = glob.sync(
                'entries/*/', {
                    cwd: join(),
                    ignore: 'node_modules'
                }
            );

            config.entries = await Promise.all(entryConfigDirs.map(async entryConfigDir => {
                let entryName = entryConfigDir.match(/entries\/(.+)\/$/)[1];
                let entryConfigPath = join(this.cwd, entryConfigDir, 'config.js');
                let entryConfig;

                if (await pathExists(entryConfigPath)) {
                    entryConfig = require(entryConfigPath);
                } else {
                    entryConfig = {};
                }

                let finalConfig = {};
                let pages = [entryName];

                merge(finalConfig, {
                    name: entryName,
                    serviceWorker: config.serviceWorker,
                    templatePath: config.templatePath,
                    pages
                }, entryConfig);

                // set urlReg
                if (finalConfig.pages.indexOf('index') !== -1) {
                    finalConfig.urlReg = /^\//;
                }
                else {
                    finalConfig.urlReg = new RegExp(`^/(${finalConfig.pages.join('|')})/`)
                }

                return finalConfig;
            }));
        }

        return config;
    }

    /**
     * in prod mode, read config.json directly instead of analysing config directory
     *
     * @return {Object} config
     */
    async readConfigFile() {
        return JsonUtil.parse(await readFile(distLavasPath(this.cwd, CONFIG_FILE), 'utf8'));
    }
}