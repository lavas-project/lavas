/**
 * @file utils.js
 * @author panyuqi (panyuqi@baidu.com)
 * @desc wrap some useful functions for Koa & express test suites
 */

import superkoa from 'superkoa';
import uuid from 'uuid';
import {join} from 'path';
import {ensureDir} from 'fs-extra';
import test from 'ava';
import {copy, remove} from 'fs-extra';
import LavasCore from '../core';

test.beforeEach('init lavas-core & server', async t => {
    // copy fixture to temp dir
    let tempDir = await makeTempDir();
    await copy(join(__dirname, 'fixtures/simple'), tempDir);

    t.context.tempDir = tempDir;
    t.context.core = new LavasCore(tempDir);
    t.context.app = createApp();
});

test.afterEach.always('clean', async t => {
    let {core, server, tempDir} = t.context;

    await core.close();
    server && server.close();
    
    // clean temp dir
    await remove(tempDir);
});

export {test};

// Test Koa when node's version >= 7.6.0 and test express otherwise.
export const isKoaSupport = true;

export function syncConfig(core, config) {
    core.config = config;
    core.builder.init(config);
}


/**
 * get test agent for Koa or express
 *
 * @param {Object} app app
 * @return {Object} agent test agent
 */
export function request(app) {
    return superkoa(app);
}

/**
 * create a app with Koa or express
 *
 * @return {Object} app app
 */
export function createApp(isForceExpress) {
    const Koa = require('koa');
    return new Koa();
}

/**
 * make temp dir in `test` dir
 *
 * @return {string} temp dir
 */
export async function makeTempDir(filepath) {
    let tempDir = join(__dirname, 'temp', uuid.v4(), (filepath || ''));
    await ensureDir(tempDir);
    return tempDir;
}
