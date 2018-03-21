import {createStore, applyMiddleware} from 'redux';
import reduxThunk from 'redux-thunk';
import reducer from './store';

function createAppStore(preloadedState = {}) {

    // middlewares
    let middlewares = [
        reduxThunk
    ];

    const store = createStore(
        reducer,
        preloadedState,
        applyMiddleware(...middlewares)
    );

    return store;
}

export default createAppStore;
