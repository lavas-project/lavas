<template>
    <div>
        Detail Page
        <router-view></router-view>
    </div>
</template>

<script>

export default {
    name: 'test',
    metaInfo: {
        title: 'Detail Page',
        meta: [
            {name: 'keywords', content: 'lavas PWA'}
        ]
    },
    async asyncData({store, route}) {}
};
</script>

<style lang="stylus" scoped>
</style>
