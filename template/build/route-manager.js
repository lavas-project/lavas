/**
 * @file route manager
 * @author panyuqi
 * @desc generate route.js, multi entries in .lavas directory
 */

'use strict';

import {readFile} from 'fs-extra';
import {join} from 'path';
import {createHash} from 'crypto';
import template from 'lodash.template';

import {generateRoutes, matchUrl} from './utils/router';
import {distLavasPath} from './utils/path';
import {writeFileInDev} from './utils/webpack';
import {ROUTES_FILE, SKELETON_DIRNAME} from './constants';

const routesTemplate = join(__dirname, './templates/routes.tpl');

export default class RouteManager {

    constructor(core) {
        this.config = core.config;
        this.env = core.env;
        this.cwd = core.cwd;

        if (this.config) {
            this.targetDir = join(this.config.globals.rootDir, './.lavas');
        }

        this.routes = [];

        this.flatRoutes = new Set();
    }

    /**
     * rewrite route path with rules
     *
     * @param {Array} rewriteRules rewrite rules
     * @param {string} path original route path
     * @return {string} path rewrited
     */
    rewriteRoutePath(rewriteRules, path) {
        for (let i = 0; i < rewriteRules.length; i++) {
            let rule = rewriteRules[i];
            let {from, to} = rule;
            /**
             * if type of 'from' is regexp, use String.replace
             */
            if (from instanceof RegExp && from.test(path)) {
                return path.replace(from, to);
            }
            /**
             * if type of 'from' is array|string, 'to' must be a
             * single rule, just replace with it
             */
            else if ((Array.isArray(from) && from.includes(path))
                || (typeof from === 'string' && from === path)) {
                return to;
            }
        }
        return path;
    }

    /**
     * merge routes with config recursively
     *
     * @param {Array} routes routes
     * @param {Array} routesConfig config
     */
    mergeWithConfig(routes, routesConfig = [], rewriteRules = [], parentPath = '') {
        /**
         * in dev mode, we need to add timestamp to every route's hash as prefix.
         * otherwise when we change the code in page.vue, route's hash remains the same,
         * webpack hot middleware will throw a "Duplicate declaration" error.
         */
        let timestamp = (new Date()).getTime();

        routes.forEach(route => {

            // add to set
            this.flatRoutes.add(route);

            // find route in config
            let routeConfig = routesConfig.find(({pattern}) => {
                return pattern instanceof RegExp ?
                    pattern.test(route.path) : pattern === route.name;
            });

            // rewrite route path with rules
            route.path = this.rewriteRoutePath(rewriteRules, route.path);
            route.fullPath = parentPath ? `${parentPath}/${route.path}` : route.path;

            // map entry to every route
            let entry = this.config.entry.find(
                entryConfig => matchUrl(entryConfig.routes, route.fullPath));
            if (entry) {
                route.entryName = entry.name;
            }

            // mixin with config, rewrites path, add lazyLoading, meta
            if (routeConfig) {
                let {
                    path: routePath,
                    lazyLoading,
                    chunkname
                } = routeConfig;

                Object.assign(route, routeConfig, {
                    path: routePath || route.path,
                    lazyLoading: lazyLoading || !!chunkname
                });
            }

            if (route.name) {
                /**
                 * generate hash for each route which will be used in routes.js template,
                 * an underscore "_" will be added in front of each hash, because JS variables can't
                 * start with numbers
                 */
                route.hash = timestamp
                    + createHash('md5').update(route.name).digest('hex');
            }

            /**
             * turn route fullpath into regexp
             * eg. /detail/:id => /^\/detail\/[^\/]+\/?$/
             */
            route.pathRegExp = new RegExp(`^${route.path.replace(/\/:[^\/]*/g, '/[^\/]+')}\/?`);

            // merge recursively
            if (route.children && route.children.length) {
                this.mergeWithConfig(route.children,
                    routeConfig && routeConfig.children, rewriteRules, route.fullPath);
            }
        });
    }

    /**
     * generate routes content which will be injected into routes.js
     * based on nested routes
     *
     * @param {Array} routes route list
     * @return {string} content
     */
    generateRoutesContent(routes) {
        return routes.reduce((prev, cur) => {
            let childrenContent = '';
            if (cur.children) {
                childrenContent = `children: [
                    ${this.generateRoutesContent(cur.children)}
                ]`;
            }
            return prev + `{
                path: '${cur.path}',
                name: '${cur.name}',
                component: _${cur.hash},
                meta: ${JSON.stringify(cur.meta || {})},
                ${childrenContent}
            },`;
        }, '');
    }

    /**
     * write routes.js for each entry
     *
     */
    async writeRoutesSourceFile() {
        await Promise.all(this.config.entry.map(async entryConfig => {
            let entryName = entryConfig.name;

            let entryRoutes = this.routes.filter(route => route.entryName === entryName);
            let entryFlatRoutes = new Set();
            this.flatRoutes.forEach(flatRoute => {
                if (flatRoute.entryName === entryName) {
                    entryFlatRoutes.add(flatRoute)
                }
            });

            let routesFilePath = join(this.targetDir, `${entryName}/routes.js`);
            let routesContent = this.generateRoutesContent(entryRoutes);

            let routesFileContent = template(await readFile(routesTemplate, 'utf8'))({
                routes: entryFlatRoutes,
                routesContent
            });
            await writeFileInDev(routesFilePath, routesFileContent);
        }));
    }

    /**
     * output routes.js into .lavas according to /pages
     *
     */
    async buildRoutes() {
        const {routes: routesConfig = [], rewrite: rewriteRules = []} = this.config.router;

        console.log('[Lavas] auto compile routes...');

        // generate routes according to pages dir
        this.routes = await generateRoutes(join(this.targetDir, '../pages'));

        // merge with routes' config
        this.mergeWithConfig(this.routes, routesConfig, rewriteRules);

        // write routes for each entry
        await this.writeRoutesSourceFile();

        console.log('[Lavas] all routes are already generated.');
    }
}
