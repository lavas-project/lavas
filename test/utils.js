import semver from 'semver';
import superkoa from 'superkoa';
import supertest from 'supertest';

export const isKoaSupport = semver.gte(
    process.env.TRAVIS_NODE_VERSION || process.versions.node, '7.6.0');

export function syncConfig(lavasCore, config) {
    lavasCore.config = config;
    lavasCore.builder.config = config;
    lavasCore.builder.webpackConfig.config = config;
}

export function request(app) {
    return isKoaSupport ? superkoa(app) : supertest(app);
}

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
