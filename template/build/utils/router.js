/**
 * @file utils.router.js
 * @author lavas
 */
import {resolve, dirname, basename} from 'path';
import glob from 'glob';

export function routes2Reg(routes) {
    let reg;
    if (typeof routes === 'string') {
        reg = new RegExp('^' + routes.replace(/\/:[^\/]*/g, '/[^\/]+') + '\/?');
    }
    else if (routes instanceof RegExp) {
        return routes;
    }

    return reg;
}

export function matchUrl (routes, url) {
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
 * @param {Object} options glob options
 * @return {Promise} resolve generated router, reject error
 */
export function generateRoutes (baseDir, options) {
    return getDirs(baseDir, '.vue', options)
        .then(dirs => {
            let tree = mapDirsInfo(dirs, baseDir)
                .reduce((tree, info) => appendToTree(tree, info.level, info), []);
            return treeToRouter(tree[0].children, {dir: baseDir});
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

    return dirs.map(dir => {
        let info = {
            dir: dir,
            level: generateDirLevel(dir, {baseDir, baseFolder}),
            type: isFolder(dir, dirs) ? 'folder' : 'file'
        };

        if (info.type === 'folder' && dirs.indexOf(dir + '.vue') > -1) {
            info.nested = true;
        }

        return info;
    })
    .filter(({type, dir}) => {
        if (type === 'folder') {
            return true;
        }

        if (dir.slice(-4) === '.vue' && dirs.indexOf(dir.slice(0, -4)) === -1) {
            return true;
        }

        return false;
    })
    .sort((a, b) => a.level.length - b.level.length);
}

function generateDirLevel(dir, {baseDir, baseFolder = basename(baseDir)}) {
    return [baseFolder]
        .concat(dir.slice(baseDir.length).split('/'))
        .filter(str => str !== '');
}

function isFolder(dir, dirs) {
    dir = dir.replace(/\/$/, '') + '/';
    return dirs.some(fileDir => fileDir.indexOf(dir) === 0);
}

function appendToTree(tree, levels, info) {
    let levelLen = levels.length;
    let node = tree;

    for (let i = 0; i < levelLen; i++) {
        let nodeLen = node.length;
        let j;

        for (j = 0; j < nodeLen; j++) {
            if (node[j].name === levels[i]) {
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

function treeToRouter(tree, parent) {
    return tree.reduce((router, {info, children}) => {
        if (info.type === 'folder' && !info.nested) {
            return router.concat(treeToRouter(children, parent));
        }

        let route = {
            path: info.dir.slice(parent.dir.length)
                .replace(/_/g, ':')
                .replace(/(\/?index)?\.vue$/, ''),
            component: info.level.join('/')
        };

        if (parent.nested) {
            route.path = route.path.replace(/^\//, '');
        }
        else if (route.path === '') {
            route.path = '/';
        }

        if (children) {
            route.component += '.vue';
            route.children = treeToRouter(children, info);
        }
        route.name = info.level.slice(1).join('-')
            .replace(/_/g, '')
            .replace(/(-index)?\.vue$/, '');

        router.push(route);
        return router;
    }, []);
}
