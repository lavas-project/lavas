
const initialState = {
    enable: true,
    type: 'fade',
    effect: 'fade'
};

export let actions = {
    setType: typeInfo => ({
        type: 'SET_TYPE',
        typeInfo
    }),

    setEffect: effect => ({
        type: 'SET_EFFECT',
        effect
    })
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_TYPE':
            return Object.assign({}, state, {
                type: action.typeInfo
            });
        case 'SET_EFFECT':
            return Object.assign({}, state, {
                effect: action.effect
            });
        default:
            return state;
    }
}
