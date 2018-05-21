/**
 * @file test case for middleware-composer.js
 * @author xtx1130@gmail.com <小菜>
 */

import {test} from '../../utils';
import {join} from 'path';
import Composer from '../../../core/middleware-composer';


test('Composer base function scope test case.', async t => {
    const {core, tempDir} = t.context;
    await core.init('development', true, {config: join(tempDir, 'lavas.config.js')});
    const composer = new Composer(core);
    composer.add(context => {});
    composer.add(context => {}, true);
    t.is(composer.internalMiddlewares.length, 2);
    composer.setup();
    t.is(composer.internalMiddlewares.length, 3);
    let com = composer.express(new Promise((resolve, reject) => resolve(1)));
    t.is(com.constructor.name, 'Function' );
    composer.reset({});
    t.is(composer.internalMiddlewares.length, 0);
    t.is(typeof composer.config.buildVersion, 'number');
});