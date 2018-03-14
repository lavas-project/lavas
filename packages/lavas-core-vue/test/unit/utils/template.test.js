/**
 * @file test case for utils/template.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {client, server} from '../../../core/utils/template';
import test from 'ava';
import {resolve} from 'path';
import {readFileSync} from 'fs-extra';

let initTemplate = readFileSync(resolve(__dirname, '../../fixtures/simple/core/index.html.tmpl'));
let ignoreSpacesAndNewLines = string => string.replace(/(>|}|;|{)(?:\s|\r|\n)+(<|{|\w|})/g, '$1$2').trim();

// current version
test('it should generate server side template', async t => {
    let serverTemplate = server(initTemplate);
    let expectedTemplate =
        `<!DOCTYPE html>
        <% meta = meta.inject() %>
        <html lang="zh_CN" data-vue-meta-server-rendered {{{ meta.htmlAttrs.text() }}}>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">

                {{{ meta.title.text() }}}
                {{{ meta.meta.text() }}}
                {{{ meta.link.text() }}}
                {{{ meta.style.text() }}}
                {{{ meta.script.text() }}}
                {{{ meta.noscript.text() }}}

                <!-- Add to home screen for Android and modern mobile browsers -->
                <link rel="manifest" href="{{ config.build.publicPath }}static/manifest.json?v={{ config.buildVersion }}">
                <!-- Add to home screen for Safari on iOS -->
                <meta name="apple-mobile-web-app-capable" content="yes">
                <meta name="apple-mobile-web-app-status-bar-style" content="black">
            </head>
            <body {{{ meta.bodyAttrs.text() }}}>
                <!--vue-ssr-outlet-->
                <% if (isProd) { %>
                <script>
                    window.onload = function () {
                        var script = document.createElement('script');
                        var firstScript = document.getElementsByTagName('script')[0];
                        script.type = 'text/javascript';
                        script.async = true;
                        script.src = '{{ config.build.publicPath }}sw-register.js?v=' + Date.now();
                        firstScript.parentNode.insertBefore(script, firstScript);
                    };
                </script>
                <% } %>
            </body>
        </html>`;

    t.is(ignoreSpacesAndNewLines(serverTemplate), ignoreSpacesAndNewLines(expectedTemplate));
});

test('it should generate client side template', async t => {
    let clientTemplate = client(initTemplate);
    let expectedTemplate =
        `<!DOCTYPE html>
        <html lang="zh_CN">
            <head>
                <title></title>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">

                <!-- Add to home screen for Android and modern mobile browsers -->
                <link rel="manifest" href="<%= htmlWebpackPlugin.options.config.build.publicPath %>static/manifest.json?v=<%= htmlWebpackPlugin.options.config.buildVersion %>">
                <!-- Add to home screen for Safari on iOS -->
                <meta name="apple-mobile-web-app-capable" content="yes">
                <meta name="apple-mobile-web-app-status-bar-style" content="black">

                <% for (var jsFilePath of htmlWebpackPlugin.files.js) { %>
                    <link rel="preload" href="<%= jsFilePath %>" as="script">
                <% } %>
                <% for (var cssFilePath of htmlWebpackPlugin.files.css) { %>
                    <% if (htmlWebpackPlugin.options.config.enableAsyncCSS) { %>
                        <link rel="preload" href="<%= cssFilePath %>" as="style" onload="this.onload=null;this.rel='stylesheet';window.STYLE_READY=1;window.mountLavas&&window.mountLavas();">
                    <% }else { %>
                        <link rel="preload" href="<%= cssFilePath %>" as="style">
                    <% } %>
                <% } %>
            </head>
            <body>
                <div id="app"></div>
            </body>
        </html>`;

    t.is(ignoreSpacesAndNewLines(clientTemplate), ignoreSpacesAndNewLines(expectedTemplate));
});

// deprecated version
test('it should generate normal client template html', async t => {
    let indexHtmlTmpl =
        `<html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
                <%= renderMeta() %>
                <%= renderManifest() %>
            </head>
            <body>
                <%= renderEntry() %>
            </body>
        </html>`;

    let resultHtml =
        `<!DOCTYPE html>
        <html lang="zh_CN">
            <head>
                <title></title>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">

                <!-- Add to home screen for Android and modern mobile browsers -->
                <link rel="manifest" href="<%= htmlWebpackPlugin.options.config.build.publicPath %>static/manifest.json?v=<%= htmlWebpackPlugin.options.config.buildVersion %>">
                <!-- Add to home screen for Safari on iOS -->
                <meta name="apple-mobile-web-app-capable" content="yes">
                <meta name="apple-mobile-web-app-status-bar-style" content="black">

                <% for (var jsFilePath of htmlWebpackPlugin.files.js) { %>
                    <link rel="preload" href="<%= jsFilePath %>" as="script">
                <% } %>
                <% for (var cssFilePath of htmlWebpackPlugin.files.css) { %>
                    <% if (htmlWebpackPlugin.options.config.enableAsyncCSS) { %>
                        <link rel="preload" href="<%= cssFilePath %>" as="style" onload="this.onload=null;this.rel='stylesheet';window.STYLE_READY=1;window.mountLavas&&window.mountLavas();">
                    <% }else { %>
                        <link rel="preload" href="<%= cssFilePath %>" as="style">
                    <% } %>
                <% } %>

                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
            </head>
            <body>
                <div id="app"></div>
            </body>
        </html>`;

    t.is(
        ignoreSpacesAndNewLines(client(indexHtmlTmpl, '/')),
        ignoreSpacesAndNewLines(resultHtml)
    );
});

test('it should generate client customized template html', async t => {
    let indexHtmlTmpl =
        `<html>
            <head>
                <%= renderManifest() %>
                <script src="<%= baseUrl %>some-static-script.js"></script>
            </head>
            <body>
                <div class="entry-wrapper" style="background: #fff">
                    <%= renderEntry() %>
                </div>
            </body>
        </html>`;

    let resultHtml =
        `<!DOCTYPE html>
        <html lang="zh_CN">
            <head>
                <title></title>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">

                <!-- Add to home screen for Android and modern mobile browsers -->
                <link rel="manifest" href="<%= htmlWebpackPlugin.options.config.build.publicPath %>static/manifest.json?v=<%= htmlWebpackPlugin.options.config.buildVersion %>">
                <!-- Add to home screen for Safari on iOS -->
                <meta name="apple-mobile-web-app-capable" content="yes">
                <meta name="apple-mobile-web-app-status-bar-style" content="black">

                <% for (var jsFilePath of htmlWebpackPlugin.files.js) { %>
                    <link rel="preload" href="<%= jsFilePath %>" as="script">
                <% } %>
                <% for (var cssFilePath of htmlWebpackPlugin.files.css) { %>
                    <% if (htmlWebpackPlugin.options.config.enableAsyncCSS) { %>
                        <link rel="preload" href="<%= cssFilePath %>" as="style" onload="this.onload=null;this.rel='stylesheet';window.STYLE_READY=1;window.mountLavas&&window.mountLavas();">
                    <% } else { %>
                        <link rel="preload" href="<%= cssFilePath %>" as="style">
                    <% } %>
                <% } %>

                <script src="/some-base-url/some-static-script.js"></script>
            </head>
            <body>
                <div class="entry-wrapper" style="background: #fff">
                    <div id="app"></div>
                </div>
            </body>
        </html>`;

    t.is(
        ignoreSpacesAndNewLines(client(indexHtmlTmpl, '/some-base-url/')),
        ignoreSpacesAndNewLines(resultHtml)
    );
});

test('it should generate normal server template html', async t => {
    let indexHtmlTmpl =
        `<html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
                <%= renderMeta() %>
                <%= renderManifest() %>
            </head>
            <body>
                <%= renderEntry() %>
            </body>
        </html>`;

    let resultHtml =
        `<!DOCTYPE html>

        <% meta = meta.inject() %>
        <html lang="zh_CN" data-vue-meta-server-rendered {{{ meta.htmlAttrs.text() }}}>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                {{{ meta.title.text() }}}
                {{{ meta.meta.text() }}}
                {{{ meta.link.text() }}}
                {{{ meta.style.text() }}}
                {{{ meta.script.text() }}}
                {{{ meta.noscript.text() }}}

                <!-- Add to home screen for Android and modern mobile browsers -->
                <link rel="manifest" href="{{ config.build.publicPath }}static/manifest.json?v={{ config.buildVersion }}">
                <!-- Add to home screen for Safari on iOS -->
                <meta name="apple-mobile-web-app-capable" content="yes">
                <meta name="apple-mobile-web-app-status-bar-style" content="black">

                {{{ renderResourceHints() }}}
                {{{ renderStyles() }}}

                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
            </head>
            <body {{{ meta.bodyAttrs.text() }}}>
                <!--vue-ssr-outlet-->

                {{{ renderScripts() }}}
                {{{ renderState() }}}

                <% if (isProd) { %>
                <script>
                    window.onload = function () {
                        var script = document.createElement('script');
                        var firstScript = document.getElementsByTagName('script')[0];
                        script.type = 'text/javascript';
                        script.async = true;
                        script.src = '{{ config.build.publicPath }}sw-register.js?v=' + Date.now();
                        firstScript.parentNode.insertBefore(script, firstScript);
                    };
                </script>
                <% } %>
            </body>
        </html>`;

    t.is(
        ignoreSpacesAndNewLines(server(indexHtmlTmpl, '/')),
        ignoreSpacesAndNewLines(resultHtml)
    );
});

test('it should generate customized server template html', async t => {
    let indexHtmlTmpl =
        `<html>
            <head>
                <script src="<%= baseUrl %>some-static-script.js"></script>
            </head>
            <body>
                <div class="entry-wrapper" style="background: #fff">
                    <%= renderEntry() %>
                </div>
            </body>
        </html>`;

    let resultHtml =
        `<!DOCTYPE html>
        <html lang="zh_CN" data-vue-meta-server-rendered>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">

                {{{ renderResourceHints() }}}
                {{{ renderStyles() }}}

                <script src="/some-base-url/some-static-script.js"></script>
            </head>
            <body>
                <div class="entry-wrapper" style="background: #fff">
                    <!--vue-ssr-outlet-->
                </div>

                {{{ renderScripts() }}}
                {{{ renderState() }}}

                <% if (isProd) { %>
                <script>
                    window.onload = function () {
                        var script = document.createElement('script');
                        var firstScript = document.getElementsByTagName('script')[0];
                        script.type = 'text/javascript';
                        script.async = true;
                        script.src = '{{ config.build.publicPath }}sw-register.js?v=' + Date.now();
                        firstScript.parentNode.insertBefore(script, firstScript);
                    };
                </script>
                <% } %>
            </body>
        </html>`;

    t.is(
        ignoreSpacesAndNewLines(server(indexHtmlTmpl, '/some-base-url/')),
        ignoreSpacesAndNewLines(resultHtml)
    );
});

// useCustomOnly both client and server
test('it should generate customizeOnly template html', async t => {
    let indexHtmlTmpl =
        `<%= useCustomOnly() %>

        script:
        {{{ renderScripts() }}}

        <!--vue-ssr-outlet-->`;

    let resultHtml =
        `script:
        {{{ renderScripts() }}}

        <!--vue-ssr-outlet-->`;

    t.is(
        ignoreSpacesAndNewLines(client(indexHtmlTmpl, '/')),
        ignoreSpacesAndNewLines(resultHtml)
    );
    t.is(
        ignoreSpacesAndNewLines(client(indexHtmlTmpl, '/some-base-url/')),
        ignoreSpacesAndNewLines(resultHtml)
    );
    t.is(
        ignoreSpacesAndNewLines(server(indexHtmlTmpl, '/')),
        ignoreSpacesAndNewLines(resultHtml)
    );
    t.is(
        ignoreSpacesAndNewLines(server(indexHtmlTmpl, '/some-base-url/')),
        ignoreSpacesAndNewLines(resultHtml)
    );
});
