<template>
    <div>
        Child1
    </div>
</template>

<script>

export default {
    name: 'child1',
    head: {
        title: 'Child1',
        meta: [
            {name: 'keywords', content: 'lavas PWA'},
            {name: 'description', content: '基于 Vue 的 PWA 解决方案，帮助开发者快速搭建 PWA 应用，解决接入 PWA 的各种问题'}
        ]
    },
    async asyncData({store, route}) {}
};
</script>

<style lang="stylus" scoped>
h2
    margin-top 50%
    font-size 46px
    font-weight 500
</style>
