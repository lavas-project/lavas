
const initialState = {
    detail: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case 'UPDATE_DETAIL':
            return Object.assign({}, state, {
                detail: action.detail
            });
        default:
            return state;
    }
};
