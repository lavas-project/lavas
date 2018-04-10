/**
 * @file middleware
 * @author zoumiaojiang(zoumiaojiang@gmail.com)
 */

'use strict';

module.exports = {

    /**
     * common middleware， execute first
     *
     * examples:
     *   'a'
     *   '{path}/a'
     *
     * @type {Array.<string>}
     */
    all: [],

    /**
     * server middleware
     *
     * @type {Array.<string>}
     */
    server: [],

    /**
     * client middleware
     *
     * @type {Array.<string>}
     */
    client: []

};
