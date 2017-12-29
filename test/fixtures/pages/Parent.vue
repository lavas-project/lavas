<template>
    <div>
        Parent Page
        <router-view></router-view>
    </div>
</template>

<script>

export default {
    name: 'parent',
    metaInfo: {
        title: 'Parent Page',
        meta: [
            {name: 'keywords', content: 'lavas PWA'}
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
