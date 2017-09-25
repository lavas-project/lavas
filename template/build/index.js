/**
 * @file index.js
 * @author lavas
 */

import Renderer from './renderer';
import ConfigReader from './config-reader';
import Builder from './builder';

import privateFileFactory from './middlewares/privateFile';
import ssrFactory from './middlewares/ssr';
import koaErrorFactory from './middlewares/koaError';
import expressErrorFactory from './middlewares/expressError';

import ora from 'ora';

import {compose} from 'compose-middleware';
import composeKoa from 'koa-compose';
import c2k from 'koa-connect';
import serve from 'serve-static';
import favicon from 'serve-favicon';

import {join} from 'path';

export default class LavasCore {
    constructor(cwd = process.cwd()) {
        this.cwd = cwd;
    }

    /**
     * invoked before build & runAfterBuild, do something different in each senario
     *
     * @param {string} env NODE_ENV
     * @param {boolean} isInBuild is in build process
     */
    async init(env, isInBuild) {
        this.env = env;
        this.isProd = this.env === 'production';
        this.configReader = new ConfigReader(this.cwd, this.env);
        this.internalMiddlewares = [];

        /**
         * in a build process, we need to:
         * 1. read config by scan a directory
         * 2. validate the config
         * 3. create a webpack config for later use
         *
         * but for online server after build, we just:
         * 1. read config.json directly
         */
        if (isInBuild) {
            // scan directory
            this.config = await this.configReader.read();
            this.renderer = new Renderer(this);
            this.builder = new Builder(this);
        }
        else {
            // read config from config.json
            this.config = await this.configReader.readConfigFile();
        }

        /**
         * only in prod build process we don't need to use middlewares
         */
        if (!(isInBuild && this.isProd)) {
            /**
             * add static files middleware only in prod mode,
             * we already have webpack-dev-middleware in dev mode
             */
            if (this.isProd) {
                this.internalMiddlewares.push(serve(this.cwd));
            }
            // serve favicon
            let faviconPath = join(this.cwd, 'static/img/icons', 'favicon.ico');
            this.internalMiddlewares.push(favicon(faviconPath));
        }
    }

    /**
     * build in dev & prod mode
     *
     */
    async build() {
        let spinner = ora();
        spinner.start();
        if (this.isProd) {
            await this.builder.buildProd();
        }
        else {
            await this.builder.buildDev();
        }
        spinner.succeed(`[Lavas] ${this.env} build completed.`);
    }

    /**
     * must run after build in prod mode
     *
     */
    async runAfterBuild() {
        this.renderer = new Renderer(this);
        // create with bundle & manifest
        await this.renderer.createWithBundle();
    }

    /**
     * compose all the middlewares
     *
     * @return {Function} koa middleware
     */
    koaMiddleware() {
        let ssrExists = this.config.entry.some(e => e.ssr);
        // transform express/connect style middleware to koa style
        return composeKoa([
            koaErrorFactory(this),
            async function (ctx, next) {
                // koa defaults to 404 when it sees that status is unset
                ctx.status = 200;
                await next();
            },
            c2k(privateFileFactory(this)),
            ...this.internalMiddlewares.map(c2k),
            ssrExists ? c2k(ssrFactory(this)) : () => {}
        ]);
    }

    /**
     * compose all the middlewares
     *
     * @return {Function} express middleware
     */
    expressMiddleware() {
        let ssrExists = this.config.entry.some(e => e.ssr);
        return compose([
            privateFileFactory(this),
            ...this.internalMiddlewares,
            ssrExists ? ssrFactory(this) : () => {},
            expressErrorFactory(this)
        ]);
    }
}
