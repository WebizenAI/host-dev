<template>
    <div>
      <button class="button is-primary" @click="login()" >{{ this.$store.getters.isLoggedIn ? 'Log out' : 'Log in'}} </button><br>
    </div>
</template>


<script>
/* eslint-disable no-console */

  import auth from 'solid-auth-client'
  const DOMAIN = process.env.VUE_APP_DOMAIN || 'https://app.solidbase.info'
  const popupUri = (new URL('popup.html', DOMAIN)).href

export default {
  name: 'LoginButton',
  mounted () {
    if (!this.$store.getters.isLoggedIn) this.trackSession()
  },
  methods: {
    async login () {
      if (this.$store.getters.isLoggedIn) {
        auth.logout().then(()=>{
          this.trackSession()
        })
      } else {
        console.log(`logging in with:\n${JSON.stringify({ popupUri })}`);
        this.session = await auth.popupLogin({ popupUri })

        this.trackSession()
      }
      //TODO: Still apparently multiple calls to tracksession
      // https://github.com/solid/solid-auth-client/issues/63
      // https://github.com/solid/solid-auth-client/issues/130
    },
    trackSession() {
      if (!this.$store.getters.isLoggedIn) this.$store.dispatch('trackSession').then(
        session => {
          this.$store.commit('setSession',session)
        },
        (err) => {
          if (err=='app not authenticated') {
            this.$dialog.alert({ //TODO: i18n
              message: `<p><code>${DOMAIN}</code> is not a registered trusted app for <a href="${this.$store.state.webId}">${this.$store.state.webId}</a></p><p>You won't be able to use the app unless you follow <a href="https://github.com/solid/userguide#using-third-party-apps">this guide</a> to specify the Solid Base app as trusted origin.</p><p>By clicking <emph>OK</emph> you are redirected to solid POD configuration.</p>`,
              type: 'is-danger',
              onConfirm: () => {
                window.location=this.$store.state.webId
              }
            })
          }
          console.log('There had been login problems')
        }
      )
    }
  }
}
</script>
