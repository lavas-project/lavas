<template>
    <div class="detail-wrapper">
        <article class="detail-content text-xs-center">
            <header class="detail-title text-xs-center">
                Detail {{$route.params.id}}
            </header>
            <router-link :to="{
                name: 'detail-id',
                params: {
                    id: Number($route.params.id) + 1
                }
            }">
                Detail {{Number($route.params.id) + 1}}
            </router-link>
            <p>
            Progressive Web Apps are user experiences that have the reach of the web, and are:
Reliable - Load instantly and never show the downasaur, even in uncertain network conditions.
Fast - Respond quickly to user interactions with silky smooth animations and no janky scrolling.
            </p>
            <router-link :to="{
                name: 'index',
            }">
                Back to home
            </router-link>
        </article>
    </div>
</template>

<script>

function setState(store) {}

export default {
    name: 'detail-id',
    head() {
        return {
            title: `Detail ${this.$route.params.id}`,
            titleTemplate: '%s - Lavas',
            meta: [
                {name: 'keywords', content: `detail ${this.$route.params.id}`},
                {name: 'description', content: `detail ${this.$route.params.id}`}
            ]
        };
    },
    async asyncData({store, route}) {
        setState(store);
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 500);
        });
    },
    created() {
        setState(this.$store);
    }
};
</script>

<style lang="stylus" scoped>

.detail-content
    font-size 16px
    line-height 30px
    margin-top 30px

    .detail-title
        margin-bottom 20px
        padding 10px 0
        font-size 36px
        font-weight bold

</style>
