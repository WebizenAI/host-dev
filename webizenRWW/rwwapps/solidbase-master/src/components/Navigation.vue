<template>
<nav class="navbar is-fixed-top" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <router-link class="navbar-item" to="/">{{$t('home')}}</router-link>

    <a role="button" @click="makeBurger" class="navbar-burger" data-target="navMenu"
      aria-label="menu" aria-expanded="false" v-bind:class="{ 'is-active': activator }">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>
  <div class="navbar-menu" id="navMenu" v-bind:class="{ 'is-active': activator }">
    <div class="navbar-start">
      <!-- navbar items -->
      <router-link class="navbar-item" to="/about">{{$t('about')}}</router-link>
      <router-link class="navbar-item" to="/chart">{{$t('chart')}}</router-link>
      <router-link class="navbar-item" to="/config">{{$t('configuration')}}</router-link>
    </div>

    <div class="navbar-end">
      <!-- navbar items -->
    </div>
  </div>
</nav>
</template>

<script>
export default {
  name: 'Navigation',
  data() {
    return {
      activator: false
    }
  },
  methods: {
    makeBurger() {
      this.activator = !this.activator
      return this.activator
    }
  }
}
</script>

<style>

</style>
