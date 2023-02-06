<template>
      <consent-banner
          :ref="'cnsntbnnr'"
          :elementId="'cnsntbnnr'"
          :debug="false"
          :position="'bottom'"
          :type="'bar'"
          :disableDecline="false"
          :transitionName="'slideFromBottom'"
          :showPostponeButton="true"
          @status="checkState"
          @clicked-accept="accept"
          @clicked-decline="decline">

          <div slot="postponeContent">
              &times;
          </div>
          <div slot="message" v-html="$t('banner-msg')"/>
          <div slot="declineContent">
            {{ $t('cancel')}}
          </div>
          <div slot="acceptContent">
              OK
          </div>
      </consent-banner>
</template>


<script>
/* eslint-disable no-console */

import ConsentBanner from 'vue-cookie-accept-decline'
export default {
  name: 'matomo-consent-banner',
  components: { ConsentBanner },
  data() {
    return {
      'cookieDuration': 14,                   // Number of days before the cookie expires, and the banner reappears
    }
  },
  methods: {
    'checkCookie': function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    },
    'accept': function() {
        this.$matomo.rememberConsentGiven(this.cookieDuration*24)
    },
    'decline': function() {
        this.$matomo.forgetConsentGiven()
    },
    'consent': function () {
      return this.checkCookie('mtm_consent') != null
    },
    'checkState': function (state) {
      switch (state) {
        case 'accept' : {
          if (! this.consent()) {
            this.$refs.cnsntbnnr.removeCookie()
            this.$refs.cnsntbnnr.init()
          }
        }
        break
        case 'decline': {
          if (this.consent()) {
            this.$refs.cnsntbnnr.removeCookie()
            this.$refs.cnsntbnnr.init()
          }
        }
      }
    }
  }
}
</script>
<style>
@import '../../node_modules/vue-cookie-accept-decline/dist/vue-cookie-accept-decline.css';
</style>
