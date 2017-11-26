/**
 * @file manifest-plugin
 * @author lavas
 */

/**
 * convert camelCase to underscore
 * eg. themeColor -> theme_color
 *
 * @param {string} origin origin string
 * @return {string} result final string
 */
function camelCase2Underscore(origin) {
    return origin.replace(
        /[A-Z]/g,
        capture => '_' + capture.toLowerCase());
}

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
        this.publicPath = opts.publicPath || '/';
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

                // add timestamp for every icon to disable cache
                config.icons[index].src = this.publicPath + item.src + '?v=' + Date.now();
            });
        }

        // support manifest which has keys in camelCase
        let manifestContent = JSON.stringify(config, (key, value) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                let replacement = {};
                Object.keys(value).forEach(originalKey => {
                    replacement[camelCase2Underscore(originalKey)] = value[originalKey];
                });
                return replacement;
            }
            return value;
        });

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
