/**
 * @file rollup 配置文件
 * @author mj(zoumiaojiang@gmail.com)
 */


import path from 'path';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default {
    entry: './index.js',
    format: 'cjs',
    plugins: [
        resolve({
            jail: path.resolve(__dirname, 'lib')
        }),
        babel({
            runtimeHelpers: true,
            exclude: 'node_modules/**' // only transpile our source code
        })
    ],
    dest: 'dist/index.js',
    sourceMap: true
};
