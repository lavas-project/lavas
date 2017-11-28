/**
 * @file utils.js
 * @author panyuqi@baidu.com (panyuqi)
 * @desc wrap some useful functions for Koa & express test suites
 */

import semver from 'semver';
import superkoa from 'superkoa';
import supertest from 'supertest';

// Test Koa when node's version >= 7.6.0 and test express otherwise.
export const isKoaSupport = semver.gte(process.versions.node, '7.6.0');

export function syncConfig(lavasCore, config) {
    lavasCore.config = config;
    lavasCore.builder.config = config;
    lavasCore.builder.webpackConfig.config = config;
}

/**
 * get test agent for Koa or express
 *
 * @param {Object} app app
 * @return {Object} agent test agent
 */
export function request(app) {
    return isKoaSupport ? superkoa(app) : supertest(app);
}

/**
 * create a app with Koa or express
 *
 * @return {Object} app app
 */
export function createApp() {
    if (isKoaSupport) {
        const Koa = require('koa');
        return new Koa();
    }
    else {
        const express = require('express');
        return express();
    }
}
