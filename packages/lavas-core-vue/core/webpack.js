/**
 * @file webpack base config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import {join, resolve, sep} from 'path';

import nodeExternals from 'webpack-node-externals';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import SWRegisterWebpackPlugin from 'sw-register-webpack-plugin';
import TimeFixWebpackPlugin from './plugins/timefix-webpack-plugin';

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

    /**
     * generate webpack base config based on lavas config
     *
     * @param {Object} buildConfig build config
     * @return {Object} webpack base config
     */
    base(buildConfig = {}) {
        let {globals, build, serviceWorker, entries} = this.config;
        /* eslint-disable fecs-one-var-per-line */
        let {path, publicPath, filenames, babel, cssSourceMap, cssMinimize,
            cssExtract, jsSourceMap,
            alias: {base: baseAlias = {}},
            defines: {base: baseDefines = {}},
            extend,
            plugins: {base: basePlugins = []}
        } = Object.assign({}, build, buildConfig);

        /* eslint-enable fecs-one-var-per-line */
        let baseConfig = {
            output: {
                path,
                publicPath
            },
            resolve: {
                extensions: ['.js', '.vue', '.json'],
                alias: Object.assign({
                    '@': globals.rootDir,
                    '$': join(globals.rootDir, '.lavas')
                }, baseAlias)
            },
            module: {
                noParse: /es6-promise\.js$/,
                rules: [
                    {
                        test: /\.vue$/,
                        use: [{
                            loader: 'vue-loader',
                            options: vueLoaders({
                                cssSourceMap,
                                cssMinimize,
                                cssExtract
                            })
                        }]
                    },
                    {
                        test: /\.js$/,
                        use: {
                            loader: 'babel-loader',
                            options: babel
                        },
                        exclude: /node_modules/
                    },
                    {
                        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: assetsPath(filenames.img)
                        }
                    },
                    {
                        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: assetsPath(filenames.fonts)
                        }
                    }
                ]
            }
        };

        let pluginsInProd = [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                sourceMap: jsSourceMap
            }),
            new OptimizeCSSPlugin({
                cssProcessorOptions: {
                    safe: true
                }
            }),
            new SWRegisterWebpackPlugin({
                filePath: resolve(__dirname, 'templates/sw-register.js'),
                prefix: (serviceWorker && serviceWorker.swPath) || publicPath,
                entries
            })
        ];

        let pluginsInDev = [
            new FriendlyErrorsPlugin()
        ];
        if (serviceWorker.enable !== false) {
            pluginsInDev.push(new SWRegisterWebpackPlugin({
                filePath: resolve(__dirname, 'templates/sw-register.js'),
                prefix: (serviceWorker && serviceWorker.swPath) || publicPath,
                entries
            }))
        }

        baseConfig.plugins = [
            ...(this.isProd ? pluginsInProd : pluginsInDev),
            new webpack.DefinePlugin(baseDefines),
            ...basePlugins
        ];

        if (cssExtract) {
            baseConfig.plugins.unshift(
                new ExtractTextPlugin({
                    filename: assetsPath(filenames.css)
                })
            );
        }

        // In dev mode, fix watchpack time problem.
        if (this.isDev) {
            baseConfig.plugins.unshift(new TimeFixWebpackPlugin());
        }

        if (typeof extend === 'function') {
            extend.call(this, baseConfig, {
                type: 'base',
                env: this.env
            });
        }

        return baseConfig;
    }

    /**
     * generate client base config based on lavas config
     *
     * @param {Object} buildConfig build config
     * @return {Object} client base config
     */
    client(buildConfig = {}) {
        let {buildVersion, globals, build, manifest, serviceWorker: workboxConfig, entries} = this.config;
        /* eslint-disable fecs-one-var-per-line */
        let {publicPath, filenames, cssSourceMap, cssMinimize, cssExtract,
            jsSourceMap, bundleAnalyzerReport, extend,
            defines: {client: clientDefines = {}},
            alias: {client: clientAlias = {}},
            plugins: {client: clientPlugins = []}} = Object.assign({}, build, buildConfig);
        /* eslint-enable fecs-one-var-per-line */

        let outputFilename = filenames.entry;
        let clientConfig = merge(this.base(buildConfig), {
            output: {
                filename: assetsPath(outputFilename),
                chunkFilename: assetsPath(filenames.chunk)
            },
            resolve: {
                alias: clientAlias
            },
            module: {
                rules: styleLoaders({
                    cssSourceMap,
                    cssMinimize,
                    cssExtract
                })
            },
            devtool: jsSourceMap ? (this.isDev ? 'cheap-module-eval-source-map' : 'nosources-source-map') : false,
            plugins: [
                // http://vuejs.github.io/vue-loader/en/workflow/production.html
                new webpack.DefinePlugin(Object.assign({
                    'process.env.VUE_ENV': '"client"',
                    'process.env.NODE_ENV': `"${this.env}"`
                }, clientDefines)),

                // split vendor js into its own file
                new webpack.optimize.CommonsChunkPlugin({
                    name: 'vendor',
                    filename: assetsPath(filenames.vendor),
                    minChunks(module, count) {
                        // any required modules inside node_modules are extracted to vendor
                        return module.resource
                            && /\.js$/.test(module.resource)
                            && module.resource.indexOf('node_modules') >= 0;
                    }
                }),

                // split vue, vue-router, vue-meta and vuex into vue chunk
                new webpack.optimize.CommonsChunkPlugin({
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
                }),

                // extract webpack runtime and module manifest to its own file in order to
                // prevent vendor hash from being updated whenever app bundle is updated
                new webpack.optimize.CommonsChunkPlugin({
                    name: 'manifest',
                    chunks: ['vue']
                }),

                // add custom plugins in client side
                ...clientPlugins
            ]
        });

        // Use workbox@3.x
        if (this.config.entries.length === 0 && workboxConfig && workboxConfig.enable !== false) {
            useWorkbox(clientConfig, this.config);
        }

        if (this.config.entries.length !== 0) {
            let entryNames = this.config.entries.map(e => e.name);
            this.config.entries.forEach(entryConfig => {
                if (entryConfig.serviceWorker && entryConfig.serviceWorker.enable !== false) {
                    useWorkbox(clientConfig, this.config, entryConfig, entryNames);
                }
            });
        }


        // if (entries && entries.length) {
        //     entries.forEach(({name}) => {
        //
        //         clientConfig.plugins.push(
        //             new InjectManifest(Object.assign({}, workboxConfig, workboxInjectManifestConfig, {
        //                 ))
        //         );
        //     });
        // }
        // else {
        //     clientConfig.plugins.push(
        //         new InjectManifest(Object.assign({}, workboxConfig, workboxInjectManifestConfig, {
        //             swSrc: join(globals.rootDir, `core/service-worker.js`),
        //             swDest: `service-worker.js`
        //         })));
        // }

        // Copy static files to /dist.
        let copyList = [{
            from: join(globals.rootDir, ASSETS_DIRNAME_IN_DIST),
            to: ASSETS_DIRNAME_IN_DIST,
            ignore: ['*.md']
        }];
        clientConfig.plugins.push(new CopyWebpackPlugin(copyList));

        // Bundle analyzer.
        if (bundleAnalyzerReport) {
            clientConfig.plugins.push(
                new BundleAnalyzerPlugin(Object.assign({}, bundleAnalyzerReport)));
        }

        if (typeof extend === 'function') {
            extend.call(this, clientConfig, {
                type: 'client',
                env: this.env
            });
        }

        return clientConfig;
    }

    /**
     * generate webpack server config based on lavas config
     *
     * @param {Object} buildConfig build config
     * @return {Object} webpack server config
     */
    server(buildConfig = {}) {
        /* eslint-disable fecs-one-var-per-line */
        let {extend, nodeExternalsWhitelist = [],
            defines: {server: serverDefines = {}},
            alias: {server: serverAlias = {}},
            plugins: {server: serverPlugins = []}
        } = this.config.build;
        /* eslint-enable fecs-one-var-per-line */

        let serverConfig = merge(this.base(buildConfig), {
            target: 'node',
            output: {
                filename: 'server-bundle.js',
                libraryTarget: 'commonjs2'
            },
            resolve: {
                alias: serverAlias
            },
            module: {
                /**
                 * Generally in ssr, we don't need any loader to handle style files,
                 * but some UI library such as vuetify will require style files directly in JS file.
                 * So we still add some relative loaders here.
                 */
                rules: styleLoaders({
                    cssSourceMap: false,
                    cssMinimize: false,
                    cssExtract: false
                })
            },
            // https://webpack.js.org/configuration/externals/#externals
            // https://github.com/liady/webpack-node-externals
            externals: nodeExternals({
                // do not externalize CSS files in case we need to import it from a dep
                whitelist: [...nodeExternalsWhitelist, /\.(css|vue)$/]
            }),
            plugins: [
                new webpack.DefinePlugin(Object.assign({
                    'process.env.VUE_ENV': '"server"',
                    'process.env.NODE_ENV': `"${this.env}"`
                }, serverDefines)),
                new VueSSRServerPlugin({
                    filename: join(LAVAS_DIRNAME_IN_DIST, SERVER_BUNDLE)
                }),
                // add custom plugins in server side
                ...serverPlugins
            ]
        });

        if (typeof extend === 'function') {
            extend.call(this, serverConfig, {
                type: 'server',
                env: this.env
            });
        }

        return serverConfig;
    }
}
