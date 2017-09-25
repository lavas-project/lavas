'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.stringify = stringify;
exports.parse = parse;

var _superJson = require('super-json');

var _superJson2 = _interopRequireDefault(_superJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsonInstance = _superJson2.default.create({
    magic: '#!',
    serializers: [_superJson2.default.dateSerializer, _superJson2.default.regExpSerializer]
});

function stringify(obj) {
    return jsonInstance.stringify(obj);
}

function parse(string) {
    return jsonInstance.parse(string);
}