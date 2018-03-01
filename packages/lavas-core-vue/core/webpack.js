/**
 * @file webpack base config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import webpack from 'webpack';
import WebpackChainConfig from 'webpack-chain';
import {join, resolve, sep} from 'path';
import chalk from 'chalk';

import nodeExternals from 'webpack-node-externals';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import SWRegisterWebpackPlugin from 'sw-register-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import TimeFixWebpackPlugin from './plugins/timefix-webpack-plugin';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';

import {vueLoaders, styleLoaders} from './utils/loader';
import {assetsPath} from './utils/path';
import {WORKBOX_PATH, getWorkboxFiles, useWorkbox} from './utils/workbox';
import {LAVAS_DIRNAME_IN_DIST, SERVER_BUNDLE, ASSETS_DIRNAME_IN_DIST} from './constants';

import fs from 'fs';
import gracefulFs from 'graceful-fs';

// solve 'too many open files' problem on Windows
// see https://github.com/webpack-contrib/copy-webpack-plugin/issues/59
gracefulFs.gracefulify(fs);

export default class WebpackConfig {
    constructor(config = {}, env) {
        this.config = config;
        this.env = env;
        this.isProd = this.env === 'production';
        this.isDev = this.env === 'development';
    }

    addStyleRules(config, options) {
        styleLoaders(options).forEach(({name, use, test}) => {
            let currentStyleRule = config.module
                .rule(`style-${name}`)
                .test(test);

            use.forEach(loader => {
                if (typeof loader === 'string') {
                    currentStyleRule.use(loader)
                        .loader(loader);
                }
                else {
                    currentStyleRule.use(loader.loader)
                        .loader(loader.loader)
                        .options(loader.options);
                }
            });
        });
    }

    /**
     * generate webpack base config based on lavas config
     *
     * @param {Object} buildConfig build config
     * @return {Object} webpackChain config
     */
    async base(buildConfig = {}) {
        let {globals, build} = this.config;
        /* eslint-disable fecs-one-var-per-line */
        let {path, publicPath, filenames, babel, cssSourceMap, cssMinimize,
            cssExtract, jsSourceMap,
            alias: {base: baseAlias = {}},
            defines: {base: baseDefines = {}}
        } = Object.assign({}, build, buildConfig);
        /* eslint-enable fecs-one-var-per-line */

        let baseConfig = new WebpackChainConfig();

        // set output
        baseConfig.output
            .path(path)
            .publicPath(publicPath);

        // set extensions & alias
        baseConfig.resolve
            .extensions.add('.js').add('.vue').add('.json');
        let aliasObject = Object.assign({
            '@': globals.rootDir,
            '$': join(globals.rootDir, '.lavas')
        }, baseAlias);
        Object.keys(aliasObject).forEach(aliasKey => {
            baseConfig.resolve.alias.set(aliasKey, aliasObject[aliasKey]);
        });

        /**
         * set module rules
         */
        baseConfig.module.noParse(/es6-promise\.js$/);

        baseConfig.module.rule('vue')
            .test(/\.vue$/)
            .use('vue')
                .loader('vue-loader')
                .options(vueLoaders({
                    cssSourceMap,
                    cssMinimize,
                    cssExtract
                }));

        baseConfig.module.rule('js')
            .test(/\.js$/)
            .use('babel')
                .loader('babel-loader')
                .options(babel)
                .end()
            .exclude.add(/node_modules/);

        baseConfig.module.rule('img')
            .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
            .use('url')
                .loader('url-loader')
                .options({
                    limit: 10000,
                    name: assetsPath(filenames.img)
                });

        baseConfig.module.rule('font')
            .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/)
            .use('url')
                .loader('url-loader')
                .options({
                    limit: 10000,
                    name: assetsPath(filenames.fonts)
                });

        /**
         * set plugins
         */
        baseConfig.plugin('define').use(webpack.DefinePlugin, [baseDefines]);

        if (cssExtract) {
            baseConfig.plugin('extract-css').use(ExtractTextPlugin, [{
                filename: assetsPath(filenames.css)
            }]);
        }

        // https://github.com/clessg/progress-bar-webpack-plugin#options
        baseConfig.plugin('progress-bar').use(ProgressBarPlugin, [{
            format: '  [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
            clear: false
        }]);

        if (this.isProd) {
            // enable scope hoisting
            baseConfig.plugin('module-concatenation').use(webpack.optimize.ModuleConcatenationPlugin);

            // https://webpack.js.org/plugins/hashed-module-ids-plugin
            baseConfig.plugin('hashed-module-ids').use(webpack.HashedModuleIdsPlugin);

            // https://github.com/lavas-project/lavas/issues/77
            baseConfig.plugin('uglify-js').use(UglifyJSPlugin, [{
                parallel: true, // enable `parallel` option
                sourceMap: jsSourceMap
            }]);

            baseConfig.plugin('optimize-css').use(OptimizeCSSPlugin, [{
                cssProcessorOptions: {
                    safe: true
                }
            }]);
        }
        else {
            // fix watchpack time problem
            baseConfig.plugin('time-fix').use(TimeFixWebpackPlugin);

            // https://webpack.js.org/plugins/named-modules-plugin
            baseConfig.plugin('named-modules').use(webpack.NamedModulesPlugin);

            baseConfig.plugin('friendly-error').use(FriendlyErrorsPlugin);
        }

        // return a webpackChain object
        return baseConfig;
    }

    /**
     * generate client base config based on lavas config
     *
     * @param {Object} internalBuildConfig build config
     * @return {Object} client base config
     */
    async client(internalBuildConfig = {}) {
        let {globals, build, serviceWorker} = this.config;

        /* eslint-disable fecs-one-var-per-line */
        let {publicPath, filenames, cssSourceMap, cssMinimize, cssExtract,
            jsSourceMap, bundleAnalyzerReport, extend, extendWithWebpackChain,
            defines: {client: clientDefines = {}},
            alias: {client: clientAlias = {}},
            plugins: {client: clientPlugins = []}} = Object.assign({}, build, internalBuildConfig);
        /* eslint-enable fecs-one-var-per-line */

        let clientConfig = await this.base(internalBuildConfig);

        // set output format
        clientConfig.output
            .filename(assetsPath(filenames.entry))
            .chunkFilename(assetsPath(filenames.chunk));

        // add alias for client
        Object.keys(clientAlias).forEach(aliasKey => {
            clientConfig.resolve.alias.set(aliasKey, clientAlias[aliasKey]);
        });

        // add module.rules for style
        this.addStyleRules(clientConfig, {
            cssSourceMap,
            cssMinimize,
            cssExtract
        });

        // set sourcemap in dev & prod mode
        clientConfig.devtool(jsSourceMap ? (this.isDev ? 'cheap-module-eval-source-map' : 'nosources-source-map') : false);

        // modify vars in DefinePlugin
        clientConfig.plugin('define').init((Plugin, args) =>
            new Plugin(Object.assign(args[0], {
                'process.env.VUE_ENV': '"client"',
                'process.env.NODE_ENV': `"${this.env}"`
            }, clientDefines)));

        // split vendor js into its own file
        clientConfig.plugin('chunk-vendor').use(webpack.optimize.CommonsChunkPlugin, [{
            name: 'vendor',
            filename: assetsPath(filenames.vendor),
            minChunks(module, count) {
                // any required modules inside node_modules are extracted to vendor
                return module.resource
                    && /\.js$/.test(module.resource)
                    && module.resource.indexOf('node_modules') >= 0;
            }
        }]);

        // split vue, vue-router, vue-meta and vuex into vue chunk
        clientConfig.plugin('chunk-vue').use(webpack.optimize.CommonsChunkPlugin, [{
            name: 'vue',
            filename: assetsPath(filenames.vue),
            minChunks(module, count) {
                // On Windows, resource path will be seperated by '\',
                // then paths like '\node_modules\vue\' cannot be matched because of '\v'.
                // Transforming into '::node_modules::vue::' can solve this.
                const PATH_SEP = '::';
                let resource = module.resource;
                let replacedResource = resource ? resource.split(sep).join(PATH_SEP) : '';
                let targets = ['vue', 'vue-router', 'vuex', 'vue-meta'];
                // /^(::vue::|::vue-router::)$/i
                let npmRegExp = new RegExp(PATH_SEP + targets.join('::|::') + PATH_SEP, 'i');
                // /^(_vue@2.4.2@vue|_vue-router@1.2.3@vue-router)$/i
                let cnpmRegExp
                    = new RegExp(targets.map(t => `_${t}@\\d+\\.\\d+\\.\\d+@${t}`).join('|'), 'i');

                return resource
                    && replacedResource.indexOf('node_modules') !== -1
                    && (npmRegExp.test(replacedResource) || cnpmRegExp.test(replacedResource));
            }
        }]);

        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        clientConfig.plugin('chunk-manifest').use(webpack.optimize.CommonsChunkPlugin, [{
            name: 'manifest',
            chunks: ['vue']
        }]);

        // Copy static files to /dist.
        let copyList = [{
            from: join(globals.rootDir, ASSETS_DIRNAME_IN_DIST),
            to: ASSETS_DIRNAME_IN_DIST,
            ignore: ['*.md']
        }];

        if (this.isProd && serviceWorker) {
            // Copy workbox.dev|prod.js from node_modules manually.
            copyList = copyList.concat(
                getWorkboxFiles(this.isProd)
                    .map(f => {
                        return {
                            from: join(WORKBOX_PATH, `../${f}`),
                            to: assetsPath(`js/${f}`)
                        };
                    })
            );

            // Use workbox@2.x in prod mode.
            useWorkbox(clientConfig, this.config);

            // inject register code for service worker into HTML
            clientConfig.plugin('sw-register').use(SWRegisterWebpackPlugin, [{
                filePath: resolve(__dirname, 'templates/sw-register.js'),
                prefix: (serviceWorker && serviceWorker.swPath) || publicPath
            }]);
        }
        clientConfig.plugin('copy').use(CopyWebpackPlugin, [copyList]);

        // Bundle analyzer.
        if (bundleAnalyzerReport) {
            clientConfig.plugin('bundle-analyzer').use(BundleAnalyzerPlugin, [bundleAnalyzerReport]);
        }

        // call extendWithWebpackChain function if provided
        let extendWithWebpackChainArray = [
            extendWithWebpackChain,
            this.config.build.extendWithWebpackChain
        ];
        for (let i = 0; i < extendWithWebpackChainArray.length; i++) {
            let extendFunc = extendWithWebpackChainArray[i];
            if (typeof extendFunc === 'function') {
                await extendFunc(clientConfig, {
                    type: 'client',
                    env: this.env
                });
            }
        }

        // convert webpackChain to plain webpack config object
        let webpackConfigObject = clientConfig.toConfig();

        if (clientPlugins && clientPlugins.length) {
            webpackConfigObject.plugins = [...webpackConfigObject.plugins, ...clientPlugins];
        }

        // call extend function if provided
        if (typeof extend === 'function') {
            extend.call(this, webpackConfigObject, {
                type: 'client',
                env: this.env
            });
        }

        return webpackConfigObject;
    }

    /**
     * generate webpack server config based on lavas config
     *
     * @param {Object} internalBuildConfig build config
     * @return {Object} webpack server config
     */
    async server(internalBuildConfig = {}) {
        /* eslint-disable fecs-one-var-per-line */
        let {extend, extendWithWebpackChain, nodeExternalsWhitelist = [],
            defines: {server: serverDefines = {}},
            alias: {server: serverAlias = {}},
            plugins: {server: serverPlugins = []}
        } = Object.assign({}, this.config.build, internalBuildConfig);
        /* eslint-enable fecs-one-var-per-line */

        let serverConfig = await this.base(internalBuildConfig);

        // set target & output
        serverConfig
            .target('node')
            .output
                .filename('server-bundle.js')
                .libraryTarget('commonjs2');

        // add alias for server
        Object.keys(serverAlias).forEach(aliasKey => {
            serverConfig.resolve.alias.set(aliasKey, serverAlias[aliasKey]);
        });

        /**
         * Generally in ssr, we don't need any loader to handle style files,
         * but some UI library such as vuetify will require style files directly in JS file.
         * So we still add some relative loaders here.
         */
        this.addStyleRules(serverConfig, {
            cssSourceMap: false,
            cssMinimize: false,
            cssExtract: false
        });

        // https://webpack.js.org/configuration/externals/#externals
        // https://github.com/liady/webpack-node-externals
        serverConfig.externals(nodeExternals({
            // do not externalize CSS files in case we need to import it from a dep
            whitelist: [...nodeExternalsWhitelist, /\.(css|vue)$/]
        }));

        // modify vars in DefinePlugin
        serverConfig.plugin('define').init((Plugin, args) =>
            new Plugin(Object.assign(args[0], {
                'process.env.VUE_ENV': '"server"',
                'process.env.NODE_ENV': `"${this.env}"`
            }, serverDefines)));

        // add vue-ssr-server-plugin
        serverConfig.plugin('ssr-server').use(VueSSRServerPlugin, [{
            filename: join(LAVAS_DIRNAME_IN_DIST, SERVER_BUNDLE)
        }]);

        // call extendWithWebpackChain function if provided
        let extendWithWebpackChainArray = [
            extendWithWebpackChain,
            this.config.build.extendWithWebpackChain
        ];
        for (let i = 0; i < extendWithWebpackChainArray.length; i++) {
            let extendFunc = extendWithWebpackChainArray[i];
            if (typeof extendFunc === 'function') {
                await extendFunc(serverConfig, {
                    type: 'server',
                    env: this.env
                });
            }
        }

        // convert webpackChain to plain webpack config object
        let webpackConfigObject = serverConfig.toConfig();

        // add plugins from `plugins` option
        if (serverPlugins && serverPlugins.length) {
            webpackConfigObject.plugins = [...webpackConfigObject.plugins, ...serverPlugins];
        }

        // call extend function if provided
        if (typeof extend === 'function') {
            extend.call(this, webpackConfigObject, {
                type: 'server',
                env: this.env
            });
        }

        return webpackConfigObject;
    }
}
