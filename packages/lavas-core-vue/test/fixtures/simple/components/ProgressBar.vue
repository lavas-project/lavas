<!-- borrowed from Nuxt! -->

<template>
    <div class="progress" :style="{
        'width': percent + '%',
        'height': height,
        'background-color': canSuccess ? color : failedColor,
        'opacity': show ? 1 : 0
    }"></div>
</template>

<script>
export default {
    data() {
        return {
            percent: 0,
            show: false,
            canSuccess: true,
            duration: 3000,
            height: '2px',
            color: '#ffca2b',
            failedColor: '#ff0000'
        };
    },
    methods: {
        start() {
            this.show = true;
            this.canSuccess = true;
            if (this._timer) {
                clearInterval(this._timer);
                this.percent = 0;
            }
            this._cut = 10000 / Math.floor(this.duration);
            this._timer = setInterval(() => {
                this.increase(this._cut * Math.random());
                if (this.percent > 95) {
                    this.finish();
                }
            }, 100);
            return this;
        },
        set(num) {
            this.show = true;
            this.canSuccess = true;
            this.percent = Math.floor(num);
            return this;
        },
        get() {
            return Math.floor(this.percent);
        },
        increase(num) {
            this.percent = this.percent + Math.floor(num);
            return this;
        },
        decrease(num) {
            this.percent = this.percent - Math.floor(num);
            return this;
        },
        finish() {
            this.percent = 100;
            this.hide();
            return this;
        },
        pause() {
            clearInterval(this._timer);
            return this;
        },
        hide() {
            clearInterval(this._timer);
            this._timer = null;
            setTimeout(() => {
                this.show = false;
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.percent = 0;
                    }, 200);
                });
            }, 500);
            return this;
        },
        fail() {
            this.canSuccess = false;
            return this;
        }
    }
};
</script>

<style lang="stylus" scoped>
.progress
    position fixed
    top 0
    left 0
    right 0
    height 2px
    width 0
    transition width .2s, opacity .4s
    opacity 1
    background-color #efc14e
    z-index 999999
</style>
