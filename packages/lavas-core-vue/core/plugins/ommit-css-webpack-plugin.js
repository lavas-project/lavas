/**
 * @file OmmitCSSPlugin
 * @author panyuqi
 * @desc filter css
 */

export default class OmmitCSSPlugin {
    constructor() {}

    apply(compiler) {
        compiler.plugin('compilation', (compilation) => {
            compilation.plugin(
                'html-webpack-plugin-alter-asset-tags',
                (args, cb) => {
                    args.head = args.head.filter((link) => link.attributes.rel !== 'stylesheet');
                    cb(null, args);
                }
            );
        });
    }
}
