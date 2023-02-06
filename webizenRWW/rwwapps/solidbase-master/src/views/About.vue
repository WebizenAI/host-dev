<template>
<div class="about">
  <h1 class="blog-title">{{$t('about')}}</h1>
  <h2 id="solidbase">solidbase</h2>
  <p class="blocktext" v-html="$t('about-solidbase')" />

  <h2 id="code"><br><br>code</h2>
  <p v-html="$t('about-code')" />
  <a href="https://lab.allmende.io/solidbase/solidbase/blob/master/LICENSE"><img
      src="https://www.gnu.org/graphics/agplv3-with-text-162x68.png" style="margin:auto;"></a>
  <br>
  <strong>Version: </strong> {{packageVersion}} <br>
  <strong>Build number: </strong>{{ commits }}<strong>&nbsp;Build date:</strong> {{ buildDate }}

  <h2 id="data"><br><br>data</h2>
  <h3 id="solid">solid</h3>
  <p class="blocktext" v-html="$t('about-data-1')" />
  <p class="blocktext" v-html="$t('about-data-2')" />
  <br>
  <b-table :data="idps" class="blocktext">
    <template slot-scope="props">
      <b-table-column field="provider" label="Provider">
        <a target="blank" :href='props.row.provider.url'>{{props.row.provider.displayName}}</a>
      </b-table-column>
      <b-table-column field="solidServer" label="Solid Server">
        <a target="blank" :href='props.row.solidServer'>{{props.row.solidServer}}</a>
      </b-table-column>
      <b-table-column field="terms" label="Terms of Services">
        <a target="blank" :href='props.row.terms.url'>{{props.row.terms.displayName}}</a>
      </b-table-column>
    </template>
  </b-table>

  <h3 id="matomo"><br>matomo</h3>
  <p class="blocktext" v-html="$t('about-data-3')" />

  <b-button type="is-primary" @click="removeCookie" style="margin:5px">{{ $t('review-tracker-settings') }}</b-button>

  <h2 id="translation"><br><br>{{$t('translation')}}</h2>
  <p v-html="$t('about-translation-p1')" />
  <p v-html="$t('about-translation-p2')" />
  <p>
  <a href="https://weblate.allmende.io/engage/solidbase/?utm_source=widget">
    <img src="https://weblate.allmende.io/widgets/solidbase/-/solidbase/287x66-white.png"
      alt="Translation status" style="margin:auto;" />
  </a>
  </p>
  <h2 id="credits"><br>credits</h2>
  <ul>
    <li v-for="person in credits" :key="person">
      {{ person }}
    </li>
  </ul>

  <br>
  <h2 id="funding">funding</h2>
  <div class="blocktext">
    <img
      :src="`https://eacea.ec.europa.eu/sites/eacea-site/files/logosbeneficaireserasmusright_${this.$locale}.jpg`"
      style="margin:auto;" />
    <p v-html="$t('about-funding')" />
  </div>
  <mtmConsent ref="mtmcnsnt"/>
</div>
</template>

<script>
import locale2 from 'locale2'
import mtmConsent from '@/components/matomo-consent-banner.vue'

import {
  version
} from '../../package.json'

export default {
  name: 'About',
  components: {
    mtmConsent
  },
  data() {
    return {
      idps: [
        {
          provider: {
            displayName: "Inrupt",
            url: "https://inrupt.com"
          },
          terms: {
            displayName: "inrupt.com",
            url: "https://inrupt.com/terms-of-service"
          },
          solidServer: "https://inrupt.net"
        },
        {
          provider: {
            displayName: "solid.community",
            url: "https://forum.solidproject.org/t/support-proposals-for-solid-community-pod-server/2666"
          },
          terms: {
            displayName: "None yet",
            url: "https://gitlab.com/solid.community/proposals/issues/1"
          },
          solidServer: "https://solid.community"
        },
        {
          provider: {
            displayName: "SolidBase Development",
            url: "https://lab.allmende.io/solidbase/solidbase/"
          },
          terms: {
            displayName: "solidbase.info",
            url: "https://solidbase.info/legal/imprint/"
          },
          solidServer: "https://ld.solidbase.info"
        },
      ],
      credits: [
        "Dr. Gualter Baptista",
        "Laura Carlson",
        "Lynn Foster",
        "Carolin Gruber",
        "Anikó Haraszti",
        "Bob Haugen",
        "Dr. Sascha Kirchner",
        "Leoš Longauer",
        "Jocelyn Parrot",
        "Jon Richter",
        "Dr. Torsten Siegmeier",
        "Jan Valeška",
        "Peter Volz",
        "Anaïs Winter",
        "Johannes Winter"
      ]
    }
  },
  computed: {
    buildDate() {
      return process.env.BUILD_DATE
    },
    commits() {
      return process.env.GIT_COMMITS
    },
    packageVersion() {
      return version
    }
  },
  mounted() {
    this.$locale = locale2.substr(0, 2)
    this.$store.state.locale = this.$locale
  },
  methods: {
    removeCookie() {
        this.$matomo.forgetConsentGiven()
        this.$refs.mtmcnsnt.$refs.cnsntbnnr.removeCookie()
        this.$refs.mtmcnsnt.$refs.cnsntbnnr.init()
    }
  }
}
</script>
