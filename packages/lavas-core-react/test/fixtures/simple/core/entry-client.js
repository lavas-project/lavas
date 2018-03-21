import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, HashRouter} from 'react-router-dom';
import {renderRoutes} from 'react-router-config';

import AsyncDataLoader from '@/components/AsyncDataLoader';
import lavasConfig from '@/.lavas/config';
import routes from '@/.lavas/router';
import createStore from './createStore';

let {
    build: {ssr, cssExtract},
    middleware: middConf = {},
    skeleton: {enable: enableSkeleton, asyncCSS},
    router
} = lavasConfig;

const store = createStore(window.__INITIAL_STATE__);
const Router = router.mode === 'hash' ? HashRouter : BrowserRouter;

/**
 * Use async CSS in SPA under following
 * 1. `skeleton.enable`
 * 2. `skeleton.asyncCSS`
 * 3. `build.cssExtract`
 */
const enableAsyncCSS = enableSkeleton && asyncCSS && cssExtract;
window.mountLavas = () => {
    setTimeout(() => {
        ReactDOM.render(
            (<Router basename={router.base}>
                <AsyncDataLoader routes={routes}>
                    {renderRoutes(routes, {store})}
                </AsyncDataLoader>
            </Router>), document.getElementById('app'));
    }, 0);
};

if (!enableAsyncCSS
    || (enableAsyncCSS && window.STYLE_READY)) {
    window.mountLavas();
}
