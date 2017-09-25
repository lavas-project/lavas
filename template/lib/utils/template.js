'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash.template');

var _lodash2 = _interopRequireDefault(_lodash);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serverTemplatePath = _fsExtra2.default.readFileSync(_path2.default.resolve(__dirname, '../templates/server.html.tmpl'));
var clientTemplatePath = _fsExtra2.default.readFileSync(_path2.default.resolve(__dirname, '../templates/client.html.tmpl'));

function inner(customTemplate, templatePath) {
    var useCustomOnlyFlag = false;
    var renderMetaFlag = false;
    var renderManifestFlag = false;
    var renderEntryFlag = false;

    var temp = (0, _lodash2.default)(customTemplate)({
        useCustomOnly: function useCustomOnly() {
            useCustomOnlyFlag = true;
            return '';
        },
        renderMeta: function renderMeta() {
            renderMetaFlag = true;
            return '';
        },
        renderManifest: function renderManifest() {
            renderManifestFlag = true;
            return '';
        },
        renderEntry: function renderEntry() {
            renderEntryFlag = true;
            return '@RENDER_ENTRY@';
        }
    });

    if (useCustomOnlyFlag) {
        return temp;
    }

    var real = (0, _lodash2.default)(templatePath)({
        renderMetaFlag: renderMetaFlag,
        renderManifestFlag: renderManifestFlag
    });

    var customHead = '';
    var customBodyBefore = '';
    var customBodyAfter = '';
    try {
        customHead = temp.match(/<head>([\w\W]+)<\/head>/)[1];
        if (renderEntryFlag) {
            customBodyBefore = temp.match(/<body>([\w\W]+)@RENDER_ENTRY@/)[1];
            customBodyAfter = temp.match(/@RENDER_ENTRY@([\w\W]+)<\/body>/)[1];
        }
    } catch (e) {}

    real = real.replace('<!-- @CUSTOM_HEAD@ -->', customHead);
    real = real.replace('<!-- @CUSTOM_BODY_BEFORE@ -->', customBodyBefore);
    real = real.replace('<!-- @CUSTOM_BODY_AFTER@ -->', customBodyAfter);

    return real;
}

exports.default = {
    client: function client(customTemplate) {
        return inner(customTemplate, clientTemplatePath);
    },

    server: function server(customTemplate) {
        return inner(customTemplate, serverTemplatePath);
    }
};
module.exports = exports['default'];