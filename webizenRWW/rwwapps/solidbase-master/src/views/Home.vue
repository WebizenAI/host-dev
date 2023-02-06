<template>

  <div class="headline">
    <h1 class="blog-title">solidbase</h1>
    <h2>{{ $t('subtitle') }}</h2>
    <h3>{{ $t('introduction') }}</h3>
    <div class="blocktext">
      <p v-html="$t('home-intro-p1')"/>
      <p v-html="$t('home-intro-p2')"/>
      <p v-html="$t('home-intro-p3')"/>
      <p v-html="$t('home-intro-p4')"/>
    </div>
    <h3>{{ $t('usage') }}</h3>
    <div class="blocktext">
      <p v-html="$t('home-usage-p1')"/>
      <p v-html="$t('home-usage-p2')"/>
      <p v-html="$t('home-usage-p3')"/>
      <p v-html="$t('home-usage-p4')"/>
      <p v-html="$t('home-usage-p5')"/>
    </div>
    <mtmConsent />
  </div>
</template>

<script>
import locale2 from 'locale2'
import mtmConsent from '@/components/matomo-consent-banner.vue'

export default {
  name: 'home',
  components: {
    mtmConsent
  },
  mounted () {
    this.$locale = locale2.substr(0,2)
    this.$store.state.locale = this.$locale
  }
}
</script>
