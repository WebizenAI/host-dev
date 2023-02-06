<template>
<div id="app">
  <nprogress-container />
  <Navigation />
  <router-view />
</div>
</template>
<script>
import Navigation from '@/components/Navigation.vue'
import NprogressContainer from "vue-nprogress/src/NprogressContainer"

export default {
  name: 'app',
  components: {
    Navigation,
    NprogressContainer
  }
}
</script>


<style lang="stylus">
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50

#nav
  padding 30px
  a
    font-weight bold
    color #2c3e50
    &.router-link-exact-active
      color #42b983
</style>
