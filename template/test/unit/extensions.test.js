/**
 * @file test case for extension feature
 * @author panyuqi (pyqiverson@gmail.com)
 */

import {join} from 'path';
import glob from 'glob';
import test from 'ava';
import LavasCore from '../../lib';
import {readFile, existsSync} from 'fs-extra';

let core;

test.beforeEach('init', async t => {
    core = new LavasCore(join(__dirname, '../fixtures'));
    await core.init('production');
});

test.serial('it should copy all the files in static directory in production mode', async t => {
    let webpackConfig = core.config.webpack;
    let outputPath = webpackConfig.base.output.path;
    let {assetsDir, copyDir} = webpackConfig.shortcuts;

    let staticFiles = glob.sync(
        '**/*', {
            cwd: copyDir
        }
    );

    await core.build();

    let staticFilesAfterBuild = glob.sync(
        '**/*', {
            cwd: join(outputPath, assetsDir)
        }
    );

    // every files in static directory should be copied
    t.true(staticFiles.every(file => staticFilesAfterBuild.indexOf(file) > -1));
});

// test.serial('it should split into 4 bundles and extract css in production mode', async t => {
//     let webpackConfig = core.config.webpack;
//     let outputPath = webpackConfig.base.output.path;
//     let {assetsDir, copyDir} = webpackConfig.shortcuts;
//
//     await core.build();
//
//     let jsFiles = glob.sync(
//         '**/*.js', {
//             cwd: join(outputPath, assetsDir, 'js')
//         }
//     );
//
//     let jsBundles = ['app', 'manifest', 'vendor', 'vue'];
//
//     // split into 4 JS bundles
//     t.true(jsBundles.every(bundle => jsFiles.some(js => js.startsWith(`${bundle}`))));
//
//     let cssFiles = glob.sync(
//         '**/*.css', {
//             cwd: join(outputPath, assetsDir, 'css')
//         }
//     );
//
//     // extract app.hash.css
//     t.true(cssFiles.some(css => /^app.*\.css$/.test(css)));
// });

// test.serial('it should prerender detail.html in production mode', async t => {
//     let webpackConfig = core.config.webpack;
//     let outputPath = webpackConfig.base.output.path;
//
//     Object.assign(core.config.router, {
//         routes: [
//             {
//                 name: 'detail-id',
//                 prerender: true,
//                 pagename: 'detail',
//                 lazyLoading: true,
//                 chunkname: 'detail-chunk',
//                 path: '/detail/rewrite/:id',
//                 meta: {
//                     keepAlive: true
//                 }
//             }
//         ]
//     });
//
//     await core.build();
//
//     // output detail.html
//     t.true(existsSync(join(outputPath, 'detail.html')));
// });
