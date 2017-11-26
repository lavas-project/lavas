
    
import _4f4adcbf8c6f66dcfc8a3282ac2bf10a from '@/pages/404.vue';
    

    
import _cee631121c2ec9232f3a2f028ad5c89b from '@/pages/500.vue';
    

    
let _ac8e138a7c5d3d9236e8143027097887 = () => import(/* webpackChunkName: "detail-chunk" */ '@/pages/detail/_id.vue');
    

    
import _6a992d5529f459a44fee58c733255e86 from '@/pages/index.vue';
    

    
import _d0e45878043844ffc41aac437e86b602 from '@/pages/parent.vue';
    

    
import _c91766ebd4ea16a48c9fd3a1fb24b195 from '@/pages/parent/child1.vue';
    

    
import _e62c448b74a5adeabab46e0bbb45c704 from '@/pages/parent/child2.vue';
    


let routes = [
    {
                path: '/404',
                name: '404',
                component: _4f4adcbf8c6f66dcfc8a3282ac2bf10a,
                meta: {},
                
            },{
                path: '/500',
                name: '500',
                component: _cee631121c2ec9232f3a2f028ad5c89b,
                meta: {},
                
            },{
                path: '/detail/:id',
                name: 'detail-id',
                component: _ac8e138a7c5d3d9236e8143027097887,
                meta: {"keepAlive":true},
                
            },{
                path: '/',
                name: 'index',
                component: _6a992d5529f459a44fee58c733255e86,
                meta: {},
                
            },{
                path: '/parent',
                name: 'parent',
                component: _d0e45878043844ffc41aac437e86b602,
                meta: {},
                children: [
                    {
                path: 'child1',
                name: 'parent-child1',
                component: _c91766ebd4ea16a48c9fd3a1fb24b195,
                meta: {},
                
            },{
                path: 'child2',
                name: 'parent-child2',
                component: _e62c448b74a5adeabab46e0bbb45c704,
                meta: {},
                
            },
                ]
            },
];

export {routes};
