import Vue from 'vue';
import Router from 'vue-router';

    
import _1511700585513951da6b7179a4f697cc89d36acf74e52 from '@/pages/Detail.vue';
    

    
import _15117005855190bda2fc21c5e56b48f0d7f7ae4f4b5f5 from '@/pages/detail/_id.vue';
    

    
import _15117005855136a992d5529f459a44fee58c733255e86 from '@/pages/Index.vue';
    

    
import _1511700585513d0e45878043844ffc41aac437e86b602 from '@/pages/Parent.vue';
    

    
import _1511700585521391be144a23ff448b04116c6332d9289 from '@/pages/parent/Child1.vue';
    

    
import _151170058552196f8cb1c54f43be82007a277f5a674f8 from '@/pages/parent/Child2.vue';
    

    
import _1511700585513cb5e100e5a9a3e7f6d1fd97512215282 from '@/pages/Error.vue';
    


let routes = [
    {
                path: '/detail',
                name: 'detail',
                component: _1511700585513951da6b7179a4f697cc89d36acf74e52,
                meta: {},
                
                children: [
                    {
                path: ':id',
                name: 'detailId',
                component: _15117005855190bda2fc21c5e56b48f0d7f7ae4f4b5f5,
                meta: {},
                
                
            },
                ]
            },{
                path: '/',
                name: 'index',
                component: _15117005855136a992d5529f459a44fee58c733255e86,
                meta: {},
                
                
            },{
                path: '/parent',
                name: 'parent',
                component: _1511700585513d0e45878043844ffc41aac437e86b602,
                meta: {},
                
                children: [
                    {
                path: 'child1',
                name: 'parentChild1',
                component: _1511700585521391be144a23ff448b04116c6332d9289,
                meta: {},
                
                
            },{
                path: 'child2',
                name: 'parentChild2',
                component: _151170058552196f8cb1c54f43be82007a277f5a674f8,
                meta: {},
                
                
            },
                ]
            },{
                    path: '/error',
                    name: 'error',
                    component: _1511700585513cb5e100e5a9a3e7f6d1fd97512215282,
                    meta: {},
                    alias: '*'
                },
];

Vue.use(Router);




const scrollBehavior = (to, from, savedPosition) => {
    if (savedPosition) {
        return savedPosition;
    } else {
        const position = {};
        // scroll to anchor by returning the selector
        if (to.hash) {
            position.selector = to.hash;
        }
        // check if any matched route config has meta that requires scrolling to top
        if (to.matched.some(m => m.meta.scrollToTop)) {
            // cords will be used if no selector is provided,
            // or if the selector didn't match any element.
            position.x = 0
            position.y = 0
        }
        // if the returned position is falsy or an empty object,
        // will retain current scroll position.
        return position;
    }
};


export function createRouter() {
    let router = new Router({
        mode: 'history',
        base: '/',
        scrollBehavior,
        routes
    });


    router.beforeEach((to, from, next) => {
        if (router.app.$store) {
            if (router.app.$store.state.pageTransition.enable) {
                
                let effect = 'fade';
                
                router.app.$store.commit('pageTransition/setType', 'fade');
                router.app.$store.commit('pageTransition/setEffect', effect);
            }
        }
        next();
    });


    return router;
}
