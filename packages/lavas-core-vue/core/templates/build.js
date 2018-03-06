const path = require('path');
const LavasCore = require('lavas-core-vue');

let core = new LavasCore(path.resolve(__dirname, '../'));
let config = void 0;

// fix https://github.com/lavas-project/lavas/issues/50
if (process.argv.length >= 3 && process.argv[2] !== 'build') {
    config = process.argv[2];
}

process.env.NODE_ENV = 'production';

// async function startBuild() {
//     await core.init(process.env.NODE_ENV, true, {config});
//     await core.build();
// }

// startBuild();
core.init(process.env.NODE_ENV, true, {config}).then(core.build);
