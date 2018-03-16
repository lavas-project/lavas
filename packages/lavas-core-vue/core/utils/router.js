/**
 * @file utils.router.js
 * @author lavas
 */
import {resolve, dirname, basename, extname} from 'path';
import glob from 'glob';
import pathToRegexp from 'path-to-regexp';

export function routes2Reg(routes) {
    let reg;
    if (typeof routes === 'string') {
        reg = pathToRegexp(routes);
    }
    else if (routes instanceof RegExp) {
        return routes;
    }

    return reg;
}

export function matchUrl(routes, url) {
    if (Array.isArray(routes)) {
        return routes.some(route => matchUrl(route, url));
    }

    let reg;
    if (typeof routes === 'string') {
        reg = new RegExp('^' + routes.replace(/\/:[^\/]*/g, '/[^\/]+') + '\/?');
    }
    else if (typeof routes === 'object' && typeof routes.test === 'function') {
        reg = routes;
    }

    return reg.test(url);
}

/**
 * generate router by the structure of pages/
 *
 * @param {string} baseDir root folder path
 * @param {Object} options generate options
 * @return {Promise} resolve generated router, reject error
 */
export function generateRoutes(baseDir, {globOptions, routerOption, entryConfig = []} = {}) {
    return getDirs(baseDir, '.vue', globOptions)
        .then(dirs => {
            dirs.sort((a, b) => a.localeCompare(b));
            let tree = mapDirsInfo(dirs, baseDir)
                .reduce((tree, info) => appendToTree(tree, info.levels, info), []);
            return treeToRouter(tree[0].children, {dir: basename(baseDir)}, routerOption, entryConfig);
        });
}

function getDirs(baseDir, ext = '', options) {
    return new Promise((res, reject) => {
        glob(resolve(baseDir, '**/*' + ext), options, (err, dirs) => {
            if (err) {
                reject(err);
            }
            else {
                let set = dirs.reduce((set, dir) => set.add(dir).add(dirname(dir)), new Set());
                res(Array.from(set));
            }
        });
    });
}

function mapDirsInfo(dirs, baseDir) {
    let baseFolder = basename(baseDir);

    let infos = dirs.reduce((list, dir) => {
        let type;

        if (extname(dir) === '.vue') {
            let regex = new RegExp(`^${dir.slice(0, -4)}$`, 'i');

            if (dirs.some(d => regex.test(d))) {
                type = 'nested';
            }
        }
        else {
            let regex = new RegExp(`^${dir}.vue$`, 'i');

            if (dirs.some(d => regex.test(d))) {
                return list;
            }

            type = 'flat';
        }

        dir = baseFolder + dir.slice(baseDir.length).replace(/\.vue$/, '');
        let levels = dir.split('/');

        list.push({
            dir,
            type,
            levels
        });

        return list;
    }, [])
    .sort((a, b) => a.dir.localeCompare(b.dir));

    return infos;
}

function appendToTree(tree, levels, info) {
    let levelLen = levels.length;
    let node = tree;

    for (let i = 0; i < levelLen; i++) {
        let nodeLen = node.length;
        let regex = new RegExp(`^${levels[i]}$`, 'i');
        let j;

        for (j = 0; j < nodeLen; j++) {
            if (regex.test(node[j].name)) {
                if (i === levelLen - 1) {
                    node[j].info = info;
                }
                else {
                    node[j].children = node[j].children || [];
                    node = node[j].children;
                }

                break;
            }
        }

        if (j === nodeLen) {
            if (i === levelLen - 1) {
                node.push({
                    name: levels[i],
                    info: info
                });
            }
            else {
                node.push({
                    name: levels[i],
                    children: []
                });
                node = node[j].children;
            }
        }
    }

    return tree;
}

function treeToRouter(tree, parent, {pathRule = 'kebabCase'} = {}, entryConfig) {
    let rr = tree.reduce((router, {info, children}) => {
        if (info.type === 'flat') {
            return router.concat(treeToRouter(children, parent, {pathRule}, entryConfig));
        }

        let route = {
            path: generatePath(info, parent, pathRule),
            component: info.dir + '.vue'
        };

        if (entryConfig.length !== 0 && info.levels.length >= 2) {
            let matchedEntry = entryConfig.find(entry => {
                for (let i = 0; i < entry.pages.length; i++) {
                    if (entry.pages[i].toLowerCase() === info.levels[1].toLowerCase()) {
                        return true;
                    }
                }
                return false;
            });

            if (matchedEntry) {
                route.entryName = matchedEntry.name;
            }
        }

        if (!children || children.every(child => !/(\/index)+$/i.test(child.info.dir))) {
            route.name = generateName(info.dir);
        }

        if (children) {
            route.children = treeToRouter(children, info, {pathRule}, entryConfig);
        }

        router.push(route);
        return router;
    }, []);

    return rr;
}

function generatePath(info, parent, rule) {
    let path = info.dir.slice(parent.dir.length)
        .replace(/(^|\/)_/g, '$1:')
        .replace(/((^|\/)index)+$/i, '');

    switch (rule) {
        case 'raw':
            break;

        case 'camelCase':
            path = path.replace(/(^|\/)([A-Z]+)/g, (full, w1, w2) => `${w1}${w2.toLowerCase()}`);

        case 'lowerCase':
            path = path.replace(/(^|\/)([^:\/]+)/g, (full, w1, w2) => full.toLowerCase());

        default:
            // default is kebabCase
            path = path.replace(
                /(^|\/)([^:\/]+)/g,
                (full, w1, w2) => (
                    w1 + w2.replace(/([a-z0-9])([A-Z]+)/g, '$1-$2').toLowerCase()
                )
            );
    }

    if (parent.type === 'nested') {
        path = path.replace(/^\//, '');
    }
    else if (path === '') {
        path = '/';
    }

    return path;
}

function generateName(dir) {
    let name = dir
        .replace(/((^|\/)index)+$/i, '')
        .split('/').slice(1)
        .map((name, i) => {
            name = name.replace(/(^|\/)_/, '');

            if (i === 0) {
                return name.replace(/^[A-Z]+/, w => w.toLowerCase());
            }

            return name.replace(/^[a-z]/, w => w.toUpperCase());
        })
        .join('');

    return name || 'index';
}
