/**
 * @file utils.router.js
 * @author lavas
 */
import {resolve, dirname, basename, posix} from 'path';
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
 * @param {Object} options glob options
 * @return {Promise} resolve generated router, reject error
 */
export function generateRoutes(baseDir, options) {
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

        let capitalizedBasename = basename(dir)
            .replace(/^(.)/, match => match.toUpperCase());
        let capitalizedDir = posix.join(dir, '..', capitalizedBasename);

        if (info.type === 'folder'
            && (
                dirs.indexOf(dir + '.vue') > -1
                || dirs.indexOf(capitalizedDir + '.vue') > -1
            )) {
            info.nested = true;
        }

        return info;
    })
    .filter(({type, dir}) => {
        if (type === 'folder') {
            return true;
        }

        let suffix = dir.slice(-4);
        let originalDir = dir.slice(0, -4);
        let lowerCaseBasename = basename(originalDir)
            .replace(/^(.)/, match => match.toLowerCase());
        let lowerCaseDir = posix.join(originalDir, '..', lowerCaseBasename);

        if (suffix === '.vue'
            && dirs.indexOf(originalDir) === -1
            && dirs.indexOf(lowerCaseDir) === -1
        ) {
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
                .replace(/^\/(.)/, match => match.toLowerCase())
                .replace(/_/g, ':')
                .replace(/(\/?index)?\.vue$/, ''),
            component: info.level.map(function (l, i) {
                return i === info.level.length - 1
                    ? l.replace(/^(.)/, match => match.toUpperCase()) : l;
            }).join('/'),
            name: info.level.slice(1).map(function (cur, i) {
                return cur
                    .replace(/_/g, '')
                    .replace(/\.vue$/, '')
                    .replace(/^(.)/, function (match) {
                        return i === 0 ? match.toLowerCase() : match.toUpperCase();
                    });
            }).join('')
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

        router.push(route);
        return router;
    }, []);
}
