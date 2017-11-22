<template>
    <div id="app">
        Main App
        <transition
            :name="pageTransitionEffect">
            <keep-alive>
                <router-view
                    :key="$route.fullPath"
                    v-if="$route.meta.keepAlive"
                    class="app-view"
                    :class="[pageTransitionClass]"
                    ></router-view>
            </keep-alive>
        </transition>
        <transition
            :name="pageTransitionEffect">
            <router-view
                :key="$route.fullPath"
                v-if="!$route.meta.keepAlive"
                class="app-view"
                :class="[pageTransitionClass]"
                ></router-view>
        </transition>
    </div>
</template>

<script>
import {mapState, mapActions} from 'vuex';

export default {
    name: 'app',
    computed: {
        ...mapState('pageTransition', {
            pageTransitionType: state => state.type,
            pageTransitionEffect: state => state.effect
        }),

        pageTransitionClass() {
            return `transition-${this.pageTransitionType}`;
        }
    },
};
</script>

<style lang="stylus">
#app
    font-family 'Avenir', Helvetica, Arial, sans-serif
    -webkit-font-smoothing antialiased
    -moz-osx-font-smoothing grayscale
    text-align center
    color #2c3e50

    .app-view
        position absolute
        top 0
        right 0
        bottom 0
        left 0
        overflow-x hidden
        overflow-y auto
        background white

        &::-webkit-scrollbar
            width 0
            background transparent

        &.transition-slide
            transition transform 0.4s cubic-bezier(.55, 0, .1, 1)

            &.slide-left-enter
                transform translate(100%, 0)

            &.slide-right-enter
                transform translate(-100%, 0)

            &.slide-right-leave-active
                transform translate(100%, 0)

            &.slide-left-leave-active
                transform translate(-100%, 0)

        &.transition-fade
            opacity 1
            transition opacity 1s ease

            &.fade-enter
                opacity 0

            &.fade-leave-active
                opacity 0

        // &.transition-slide-fade
        //     &.slide-fade-enter-active
        //         transition: all .3s ease
        //
        //     &.slide-fade-leave-active
        //         transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0)
        //
        //     &.slide-fade-enter,
        //     &.slide-fade-leave-to
        //         transform: translateX(10px)
        //         opacity: 0
</style>
