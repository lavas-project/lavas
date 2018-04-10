/**
 * @file timefix-webpack-plugin
 * @author lavas
 * @desc Taken from https://github.com/egoist/poi/blob/3e93c88c520db2d20c25647415e6ae0d3de61145/packages/poi/lib/webpack/timefix-plugin.js#L1-L16
 * It provides a better way to hack watchpack compared with `utils.webpack.writeFileInDev()`, because
 * in some third-party plugins such as workbox-webpack-plugin, we can't force them to use `writeFileInDev`.
 */

export default class TimeFixPlugin {
    constructor(timefix = 11000) {
        this.timefix = timefix;
    }

    apply(compiler) {
        compiler.plugin('watch-run', (watching, callback) => {
            watching.startTime += this.timefix;
            callback();
        });

        compiler.plugin('done', stats => {
            stats.startTime -= this.timefix;
        });
    }
}
