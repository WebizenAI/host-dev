<template>
<section>
</section>
</template>

<script>
import auth from 'solid-auth-client'

export default {
  name: 'loadBudget',
  props: ['url'],
  computed: {
    readable() {
      return this.url
    }
  },
  mounted() {
    this.$store.state.ro = true
    auth.logout()
    this.$router.push({
      name: 'chart',
      params: {
        url: this.url
      }
    })
  }
}
</script>
