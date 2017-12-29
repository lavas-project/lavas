<template>
    <div>
        <h2 class="gray--text">LAVAS</h2>
        <span>{{webpackDefineTestVar}}</span>
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
    async asyncData({store, route}) {},
    data() {
        return {
            webpackDefineTestVar: DEFINE_TEST_VAR
        }
    }
};
</script>

<style lang="stylus" scoped>
h2
    margin-top 50%
    font-size 46px
    font-weight 500
</style>
