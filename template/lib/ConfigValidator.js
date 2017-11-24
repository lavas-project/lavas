'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _ajv = require('ajv');

var _ajv2 = _interopRequireDefault(_ajv);

var _LavasConfigSchema = require('./LavasConfigSchema.json');

var _LavasConfigSchema2 = _interopRequireDefault(_LavasConfigSchema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ajv = new _ajv2.default({
    errorDataPath: 'configuration',
    allErrors: true,
    verbose: true
});
var _validate = ajv.compile(_LavasConfigSchema2.default);

var ConfigValidator = function () {
    function ConfigValidator() {
        (0, _classCallCheck3.default)(this, ConfigValidator);
    }

    (0, _createClass3.default)(ConfigValidator, null, [{
        key: 'validate',
        value: function validate(config) {
            if (!_validate(config)) {
                if (_validate.errors && _validate.errors.length) {
                    throw new Error(_validate.errors.reduce(function (prev, cur) {
                        var dataPath = cur.dataPath,
                            message = cur.message;

                        dataPath = dataPath ? dataPath + ' ' : '';
                        return '' + prev + dataPath + message + '\n';
                    }, ''));
                }
            }
        }
    }]);
    return ConfigValidator;
}();

exports.default = ConfigValidator;
module.exports = exports['default'];