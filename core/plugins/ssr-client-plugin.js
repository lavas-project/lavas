/**
 * @file modify vue-ssr-client-plugin, support multi-entries
 * @author lavas
 */

import hash from 'hash-sum';
import uniq from 'lodash.uniq';

const isJS = file => /\.js(\?[^.]+)?$/.test(file);

/**
 * VueSSRClientPlugin
 *
 * @class
 */
export default class VueSSRClientPlugin {
    constructor(options = {}) {
        this.options = Object.assign({
            filename: 'vue-ssr-client-manifest.json'
        }, options);
    }

    apply(compiler) {
        compiler.plugin('emit', (compilation, cb) => {
            const stats = compilation.getStats().toJson();

            Object.keys(stats.entrypoints).forEach(entryName => {

                const allFiles = uniq(stats.assets
                    .map(a => a.name));

                const initialFiles = uniq(stats.entrypoints[entryName].assets
                    .filter(isJS));

                const asyncFiles = allFiles
                    .filter(isJS)
                    .filter(file => initialFiles.indexOf(file) < 0);

                const manifest = {
                    publicPath: stats.publicPath,
                    all: allFiles,
                    initial: initialFiles,
                    async: asyncFiles,
                    modules: {}
                };

                const assetModules = stats.modules.filter(m => m.assets.length);
                const fileToIndex = file => manifest.all.indexOf(file);
                stats.modules.forEach(m => {
                    // ignore modules duplicated in multiple chunks
                    if (m.chunks.length === 1) {
                        const cid = m.chunks[0];
                        const chunk = stats.chunks.find(c => c.id === cid);
                        if (!chunk || !chunk.files) {
                            return;
                        }
                        const files = manifest.modules[hash(m.identifier)] = chunk.files.map(fileToIndex);
                        // find all asset modules associated with the same chunk
                        /* eslint-disable max-nested-callbacks */
                        assetModules.forEach(m => {
                            if (m.chunks.some(id => id === cid)) {
                                files.push.apply(files, m.assets.map(fileToIndex));
                            }
                        });
                        /* eslint-enable max-nested-callbacks */
                    }
                });

                const json = JSON.stringify(manifest, null, 2);

                let manifestPath = this.options.filename.replace('[entryName]', entryName);
                let source = () => json;
                let size = () => json.length;
                compilation.assets[manifestPath] = {
                    source,
                    size
                };
            });

            cb();
        });
    }
}
