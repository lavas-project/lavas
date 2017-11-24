/**
 * @file Lavas 内置的 manifest.json 生成的 webpack 插件
 * @author mj(zoumiaojiang@gmail.com)
 */

/**
 * Generate manifest.json file
 *
 * @class
 */
export default class ManifestJson {

    /**
     * constructor
     *
     * @param {*} opts options
     * @param {Object} opts.config config
     * @param {string} opts.path path
     */
    constructor(opts) {
        this.config = opts.config;
        this.path = opts.path;
    }

    /**
     * webpack apply
     *
     * @param {*} compiler webpack compiler
     */
    apply(compiler) {

        let config = this.config;

        if (config && config.icons && config.icons.length > 0) {
            config.icons.forEach((item, index) => {

                // 加上时间戳，做浏览器缓存
                config.icons[index].src = item.src + '?v=' + Date.now();
            });
        }

        let manifestContent = JSON.stringify(this.config);

        compiler.plugin('emit', (compilation, callback) => {
            compilation.assets[this.path] = {
                source() {
                    return manifestContent;
                },

                size() {
                    return manifestContent.length;
                }
            };

            callback();
        });
    }

}
