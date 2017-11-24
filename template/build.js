/**
 * @file build.js
 * @author lavas
 */

const LavasCore = require('./lib');

let core = new LavasCore(__dirname);

core.init('production', true).then(() => {
    return core.build();
}).then(() => {
    // TODO: fix a building bug in prod mode
    process.exit(0);
}).catch((e) => {
    console.error(e);
});
