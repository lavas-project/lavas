/**
 * @file utils.json
 * @author lavas
 */
import superJson from 'super-json';
import {pick, isObject} from 'lodash';

const jsonInstance = superJson.create({
    magic: '#!',
    serializers: [
        superJson.dateSerializer,
        superJson.regExpSerializer
    ]
});

export const stringify = jsonInstance.stringify;

export const parse = jsonInstance.parse;

/**
 * use _.pick recursively
 * https://github.com/mohsen1/deep_pick
 *
 * @param {Object|Array} object srcObject
 * @param {Object|Array} json pickObject
 * @return {Object} object after pick
 */
export function deepPick(object, json) {
    if (Array.isArray(json) && Array.isArray(object)) {
        return object.map(item => {
            if (isObject(item)) {
                return deepPick(item, json[0]);
            }
            return item;
        });
    }
    let keys = Object.keys(json);
    object = pick(object, keys);
    keys.forEach(key => {
        if (isObject(json[key])) {
            object[key] = deepPick(object[key], json[key]);
        }
    });
    return object;
}
