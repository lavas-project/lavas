/**
 * @file test case for utils/logger.js
 * @author panyuqi (pyqiverson@gmail.com)
 */

import Logger from '../../../core/utils/logger';
import test from 'ava';
import sinon from 'sinon';
import chalk from 'chalk';

test.beforeEach('spy for console.log', t => {
    sinon.spy(console, 'log');
});

test.afterEach('restore spy', t => {
    console.log.restore();
});

test('it should log in INFO/WARN/ERROR level correctly.', t => {
    Logger.info('build', 'content');
    Logger.debug('build', 'content');
    Logger.warn('build', 'content');
    Logger.error('build', 'content');

    let expectedInfoMessage = chalk.green.bold('[Lavas build] ') + chalk.white('content');
    let expectedWarnMessage = chalk.yellow.bold('[Lavas build] ') + chalk.white('content');
    let expectedErrorMessage = chalk.red.bold('[Lavas build] ') + chalk.white('content');

    t.true(console.log.calledThrice);
    t.is(console.log.getCall(0).args[0], expectedInfoMessage);
    t.is(console.log.getCall(1).args[0], expectedWarnMessage);
    t.is(console.log.getCall(2).args[0], expectedErrorMessage);
});

test('it should not log any message when level = -1.', t => {
    Logger.options.level = -1;
    Logger.info('build', 'content');
    Logger.debug('build', 'content');
    Logger.warn('build', 'content');
    Logger.error('build', 'content');

    t.true(console.log.callCount === 0);
});

test('it should only log in ERROR level.', t => {
    Logger.options.level = 0;
    Logger.info('build', 'content');
    Logger.debug('build', 'content');
    Logger.warn('build', 'content');
    Logger.error('build', 'content');

    t.true(console.log.calledOnce);
});

test('it should only log in WARN level.', t => {
    Logger.options.level = 1;
    Logger.info('build', 'content');
    Logger.debug('build', 'content');
    Logger.warn('build', 'content');
    Logger.error('build', 'content');

    t.true(console.log.calledTwice);
});

test('it should log all message in DEBUG level.', t => {
    Logger.options.level = 3;
    Logger.info('build', 'content');
    Logger.debug('build', 'content');
    Logger.warn('build', 'content');
    Logger.error('build', 'content');

    t.true(console.log.callCount === 4);
});

test('it should log all message in DEBUG level.', t => {
    Logger.info('build', 'content', true);
    Logger.info('build', 'content', true, true);

    t.true(console.log.callCount === 0);
});
