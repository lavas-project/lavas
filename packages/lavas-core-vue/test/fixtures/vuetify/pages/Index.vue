<template>
    <div>
        <h2 class="gray--text">LAVAS</h2>
    </div>
</template>

<script>

export default {
    name: 'index',
    metaInfo: {
        title: 'Home',
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
