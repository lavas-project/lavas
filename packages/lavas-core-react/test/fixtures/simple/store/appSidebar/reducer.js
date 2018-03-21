
let initialState = {
    show: false,

    // 头部条的相关配置
    title: {
        imageLeft: '',
        altLeft: '',
        iconLeft: 'home',
        text: 'Home',
        imageRight: '',
        altRight: '',
        iconRight: ''
    },

    // user: {
    //     name: 'Lavas',
    //     email: 'lavas@baidu.com',
    //     location: 'Shanghai'
    // },

    // 分块组
    blocks: [
        {
            // 子列表1
            sublistTitle: 'Sublist1',
            list: [
                {
                    text: 'Detail Page 1',
                    icon: 'sentiment_satisfied',
                    route: '/page1'
                },
                {
                    text: 'Detail Page 2',
                    image: 'https://github.com/google/material-design-icons/blob/master/social/2x_web/ic_mood_bad_black_48dp.png?raw=true',
                    alt: 'mood-bad',
                    route: '/page2'
                },
                {
                    text: 'Detail Page 3',
                    icon: 'sentiment_neutral',
                    route: '/detail/3'
                }
            ]
        }
    ]
};

export default (state = initialState, action) => {
    switch (action.type) {
        case 'SHOW_SIDEBAR':
            return Object.assign({}, state, {
                show: true
            });
        case 'HIDE_SIDEBAR':
            return Object.assign({}, state, {
                show: false
            });
        default:
            return state;
    }
};
