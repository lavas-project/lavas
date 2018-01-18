<template>
    <div>
        <div class="error-wrapper">
            <div class="err-image"></div>
            <p class="title">“ Oops ~ ”</p>
            <p class="content">{{ message }}</p>
            <a href="/">返回首页</a>
        </div>
    </div>
</template>
<script>
export default {
    name: 'error',
    metaInfo: {
        title: '服务器开小差了'
    },
    computed: {
        message() {
            return this.$route.params.error || '服务器开小差了 o(╥﹏╥)o';
        }
    },
    created() {
        let query = this.$route.query;
        if (Object.keys(query).length !== 0) {
            this.$router.replace({
                name: 'error',
                params: query
            });
        }
    }
};
</script>

<style lang="stylus" scoped>
    .error-wrapper
        width 100%
        margin 0 auto
        color #969696
        text-align center
        font-size rem(14)
        position absolute
        top 30%
        transform translateY(-50%)
        .err-image
            width rem(120)
            height rem(120)
            margin rem(10) auto
            background url('../static/img/error-icon.png') no-repeat
            background-size cover
        .title
            margin 50px 0 20px 0
            color #000
            font-weight bold
            font-size rem(24)
        .content
            margin 10px 0
        a
            font-size rem(12)
            display block
            margin-top 20px
            color #4183c4
</style>
