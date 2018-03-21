
import initialState from './state';

export default (state = initialState, action) => {
    switch (action.type) {
        case 'SET_APP_HEADER':
            return Object.assign({}, state, action.config);
        default:
            return state;
    }
};