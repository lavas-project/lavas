/**
 * @file use vue-meta plugin
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import Meta from 'vue-meta';

Vue.use(Meta, {
    keyName: 'head', // vue-meta 的参数名称
    attribute: 'data-vue-meta', // 由 vue-meta 渲染的元素会添加一个属性 <title data-vue-meta=""></title>
    ssrAttribute: 'data-vue-meta-server-rendered', // 由服务器端渲染的 vue-meta 元素的自定义属性名称
    tagIDKeyName: 'vmid' // vue-meta 用于确定是否覆盖或附加标签的属性名称
});

Vue.config.productionTip = false;
