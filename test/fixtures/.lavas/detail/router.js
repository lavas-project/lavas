import Vue from 'vue';
import Router from 'vue-router';

    
import _15112725984420bda2fc21c5e56b48f0d7f7ae4f4b5f5 from '@/pages/detail/_id.vue';
    

    
import _1511272598442cb5e100e5a9a3e7f6d1fd97512215282 from '@/pages/Error.vue';
    


let routes = [
    {
                path: '/detail/:id',
                name: 'detailId',
                component: _15112725984420bda2fc21c5e56b48f0d7f7ae4f4b5f5,
                meta: {},
                
                pathToRegexpOptions: { strict: true },
                
            },{
                    path: '/error',
                    name: 'error',
                    component: _1511272598442cb5e100e5a9a3e7f6d1fd97512215282,
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



    return router;
}
