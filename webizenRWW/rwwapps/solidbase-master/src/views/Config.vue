<template>
<div class="config">
  <h1>{{ $t('configuration') }}</h1>
  <h3>Here you can log
    {{ loggedIn ? 'out of' : 'in to'  }} SoLiD</h3><br>
  {{$t('whats-solid')}}
  <br><br><br>
  <b-field horizontal style="display: flex;">
    <LoginButton />
    <b-field style="text-align: left;" message='Use <a target="blank" href="https://github.com/solid/query-ldflex">ldflex</a>'  title="This option makes troubles with older browsers and exotic network configuration. It can be savely disabled.">
      <b-switch :disabled="loggedIn" v-model="$store.state.ldflex" />
    </b-field>
  </b-field>
  <div v-if="loggedIn && $store.state.webId">
    <PersonalInfo />
    <div :title="$t('change-locale')">
      {{$t('preferred-locale')}} <strong>{{locale}}</strong>.
    </div>
    <hr>
    <div v-if="this.$store.state.admin && $store.state.eClassGraphAdmin.statements.length">
      <div style="display: inline-block;">
        <h2>{{$t('super-menu')}}</h2>
        <h3>{{$t('exp-cat-conf')}}</h3>
        <classEditor :admin='true' />
        <hr>
      </div>
    </div>
    <hr>
    <div v-if="$store.state.eClassGraph.statements.length">
      <h2>{{$t('exp-cat-conf')}}</h2>
      <div style="display: inline-block;">
        <classEditor :admin='false' />
      </div>
      <hr>
    </div>
  </div>
  <mtmConsent/>

  <!-- <div> TODO: make work
    <b-loading :is-full-page="true" :active="loggedIn">
      <b-icon pack="fas" icon="sync-alt" size="is-large" custom-class="fa-spin">
      </b-icon>
    </b-loading>
  </div> -->
</div>
</template>


<script>
/* eslint-disable no-console */

import locale2 from 'locale2'
import LoginButton from '@/components/LoginButton.vue'
import PersonalInfo from '@/components/PersonalInfo.vue'
import classEditor from '@/components/classEditor.vue'
import mtmConsent from '@/components/matomo-consent-banner.vue'

export default {
  name: 'Config',
  data() {
    return {
      expenseClasses: this.$store.state.expenseClasses,
      expenseClass: null,
      exampleExpenseClass: null,
      content: "",
      exampleContent: "",
      className: ""
    }
  },
  components: {
    LoginButton,
    PersonalInfo,
    classEditor,
    mtmConsent
  },
  computed: {
    loggedIn() {
      let loggedIn = this.$store.getters.isLoggedIn
      console.log('Login status in config.vue: ' + loggedIn)
      return loggedIn
    },
    locale() {
      return locale2.substr(0, 2)
    }
  },
  mounted() {
    this.$locale = this.locale
    this.$store.state.locale = this.locale
  }
}
</script>



<style>
@import '~easymde/dist/easymde.min.css';
</style>
