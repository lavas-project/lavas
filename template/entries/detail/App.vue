<template>
    <div id="app">
        Detail App
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: 'app'
};
</script>

<style lang="stylus">
#app
    font-family 'Avenir', Helvetica, Arial, sans-serif
    -webkit-font-smoothing antialiased
    -moz-osx-font-smoothing grayscale
    text-align center
    color #2c3e50
</style>
