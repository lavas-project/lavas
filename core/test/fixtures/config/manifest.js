/**
 * @file manifest config
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

/* eslint-disable fecs-camelcase */
module.exports = {

    /**
     * manifest start url
     *
     * @type {string}
     */
    start_url: '/',

    /**
     * manifest name
     *
     * @type {string}
     */
    name: '*__name__*',

    /**
     * manifest short name
     *
     * @type {string}
     */
    short_name: '*__name__*',

    /**
     * manifest icon list
     *
     * @type {Array<Object>}
     */
    icons: [
        {
            src: '/static/img/icons/android-chrome-192x192.png',
            type: 'image/png',
            size: '512x512'
        }
    ],

    /**
     * manifest display type
     *
     * @type {string}
     */
    display: 'standalone',

    /**
     * manifest background color
     *
     * @type {string}
     */
    background_color: '#000000',

    /**
     * manifest theme color
     *
     * @type {string}
     */
    theme_color: '#278fef'
};
