/**
 * @file utils.json
 * @author lavas
 */
import superJson from 'super-json';

const jsonInstance = superJson.create({
    magic: '#!',
    serializers: [
        superJson.dateSerializer,
        superJson.regExpSerializer
    ]
});

export function stringify(obj) {
    return jsonInstance.stringify(obj);
}

export function parse(string) {
    return jsonInstance.parse(string);
}
