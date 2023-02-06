<template>
    <div v-if="this.$store.getters.isLoggedIn">
      {{$t('logged-in-as')}}<br>
      <b> {{ this.$store.state.name }}</b><br>
      {{$t('web-id-is')}}<br>
      <code><a :href='this.$store.state.webId'>{{ this.$store.state.webId }}</a></code>
    </div>
</template>


<script>
export default {
  name: 'PersonalInfo',
}
</script>
