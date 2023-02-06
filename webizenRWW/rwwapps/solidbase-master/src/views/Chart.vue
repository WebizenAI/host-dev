<template>
<div class="Chart" id="head">
  <div v-if="loadedData">
    <b-field v-if="$store.state.ro" :label="$t('from-examples')" style="text-align: left;">
      <b-select  v-model="selectedExampleBudget" @input="loadBudgetFrom($event.uri.value)">
          <option
              v-for="budget in exampleBudgets"
              :value="budget"
              :key="budget.mtime">

              {{$store.getters.budgetName(budget)}}
          </option>
      </b-select>
    </b-field>
    <h1 class="blog-title">
      {{ this.$store.getters.iniName() }}<br>
    </h1>
    <i18n path="budget-year" tag="h2">
      <span slot="year">
          {{this.$store.getters.budgetYear()}}<br>
      </span>
    </i18n>
    <i18n path="currency-is" tag="h4">
      <span slot="currency">
        {{currency()}}
      </span>
    </i18n>
    <i18n path="activity-name" tag="h3">
      <span slot="activity">
        {{focus.name}}
      </span>
    </i18n>
    <div class="columns">
      <div class="column" style="min-width:0;" ref="pieColumn">
        <i18n path="headline-chart" tag="h3">
          <span slot="item">
            <b>{{ $store.getters.classLabel({ressource: selected.classification}) || focus.name }}</b>
          </span>
          <span slot="things">
            {{selected.classification ? $tc('expense',2) : $t('exp-cats')}}
          </span>
        </i18n>
        <Pie :chartData="this.datacollection" :options="this.chartoptions"
          :styles="pieStyles" />
      </div>
      <div class="column" v-if="selected.classification">
        <i18n path="about-category" tag="h3">
          <strong slot="category">
            {{$store.getters.classLabel({ressource: selected.classification})}}
          </strong>
        </i18n>
        <span v-html='selectedClassText' />
      </div>
    </div>
    <div class="columns" v-if="$store.getters.topProcess() != undefined">
      <div class="column">
        <i18n v-if="!selected.classification" path="calc-string-activity" tag="span">
          <span v-if="budget.iSum" slot="and-incomes">
            {{$t('and-incomes')}}
          </span>
          <span slot="activity">
            <b>{{focus.name}}</b>
          </span>
          <span slot="amount-money">
            {{ budget.iSum > 0 ? `(${$n(budget.eSum, 'currency', locale())} - ${$n(budget.iSum, 'currency', locale())}) = ` : ''}}{{$n(budget.size, 'currency', locale())}}
          </span>
        </i18n>
        <i18n v-if="!selected.classification && focus.ID.value==$store.getters.topProcess().value" path="calc-string-per-member" tag="span">
          <span slot="amount-members">
            {{ numberOfMembers }}
          </span>
          <span slot="new-line">
            <br>
          </span>
          <span slot="amount-per-member">
            {{ $n(budget.size / numberOfMembers,'currency', locale()) }}
          </span>
        </i18n>
        <i18n v-if="selected.classification" path="calc-string-category" tag="div">
          <span slot="category">
            <strong>
              {{$store.getters.classLabel({ressource: selected.classification})}}
            </strong>
          </span>
          <span slot="amount">
            {{$n(budget.eSum, 'currency', locale())}}
            <span :title="$t('of-expenses')">
              ({{Math.round((budget.eSum/focus.eSum)*100)}}%)
            </span>
          </span>
          <span slot="activity">
            <strong>{{focus.name}}</strong>
          </span>
        </i18n>
        <i18n v-if="processes.ascendants && processes.ascendants.length>0" path="calc-string-lower-activity" tag="div">
          <span slot="activity">
            <b>{{focus.name}}</b>
          </span>
          <span slot="ascendant">
            <a @click="fillData(processes.ascendants[0].ID)">{{processes.ascendants[0].name}}</a>
          </span>
          <span slot="percentage" :title="$t('of-expenses')">
            {{Math.round((focus.eSum/processes.ascendants[0].eSum)*100)}}%
          </span>
        </i18n>
      </div>
      <div class="column" v-if="selected.classification" style="justify-content:flex-start;">
        <button class="button is-primary" @click="clickedChart()" :title="$t('click-on-chart')">
          {{$t('overview')}}
        </button>
      </div>
    </div>
    <div>
      <span v-html='htmlNote(focus.ID)' />
    </div>
    <div style="text-align:right;">
      <b-field horizontal style="display: inline-block;">
        <b-field :message="$t('toggle-notes')" style="text-align: left;" :title="$t('toggle-notes-help')">
          <b-switch v-model="displayNotes" />
        </b-field>
        <b-field :message="$t('toggle-annual')" style="text-align: left;" :title="$t('toggle-annual-help')">
          <b-switch v-model="annualView" />
        </b-field>
      </b-field>
    </div>
    <!-- Only show if a expense category is selected  -->
    <div v-if="selected.classification">
      <div v-if="absIntents.length">
        <button class="button" v-if="joiningEnabled" @click="isJoinModalActive = true"
          style="display: flex;" :title="$t('merge-selected')">
          {{$t('join-exp')}}
        </button>
        <b-modal :active.sync="isJoinModalActive" has-modal-card>
          <joinIntentsModal :intents="intentsToJoin" @repaintChart="fillData(focus.ID)" />
        </b-modal>

        <!-- ABSTRACT INTENTS  -->
        <b-tooltip :label="$t('sub-cost-contribs')">
          <b-table :data="absIntents" :checkable="joiningEnabled" :checked-rows.sync="intentsToJoin"
            focusable>
            <template slot-scope="props">
              <b-table-column sortable field="label" :label="$t('abstract-expenses')"  style="text-align:left;">
                {{props.row.label}}
              </b-table-column>
              <b-table-column field="details" :label="$t('origin')"  style="text-align:left;">
                <div v-for="inc in includes(props.row.ID)" :key="inc.ID.value" :title="`${$t('sub-cost-name')}: ${inc.name}`">
                  <b-tooltip :label='`Focus ${inc.processName}`'>
                    <a @click="fillData(inc.processId)">
                      {{ inc.processName }}
                      ({{ ($store.getters.intentValue(inc.ID)/$store.getters.intentValue(props.row.ID)*100).toFixed(2)}}%)
                    </a>
                  </b-tooltip>
                </div>
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="january" :label="$t('january')">
                <money :locale="locale()" :amount="props.row.january" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="february"
                :label="$t('february')">
                <money :locale="locale()" :amount="props.row.february" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="march" :label="$t('march')">
                <money :locale="locale()" :amount="props.row.march" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="april" :label="$t('april')">
                <money :locale="locale()" :amount="props.row.april" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="may" :label="$t('may')">
                <money :locale="locale()" :amount="props.row.may" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="june" :label="$t('june')">
                <money :locale="locale()" :amount="props.row.june" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="july" :label="$t('july')">
                <money :locale="locale()" :amount="props.row.july" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="august" :label="$t('august')">
                <money :locale="locale()" :amount="props.row.august" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="september"
                :label="$t('september')">
                <money :locale="locale()" :amount="props.row.september" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="october" :label="$t('october')">
                <money :locale="locale()" :amount="props.row.october" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="november"
                :label="$t('november')">
                <money :locale="locale()" :amount="props.row.november" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="december"
                :label="$t('december')">
                <money :locale="locale()" :amount="props.row.december" />
              </b-table-column>
              <b-table-column numeric :style="styleColor(props.row.label)" sortable field="annual" :label="$t('annual-sum')">
                <money :locale="locale()" :amount="props.row.annual" />
              </b-table-column>
              <b-table-column :visible="displayNotes" :label="$t('notes')">
                <span v-html="htmlNote(props.row.ID)" />
              </b-table-column>
              <b-table-column :visible="!$store.state.ro">
                <editPintModalButton type='expense' :item="{
                                          name: props.row.label,
                                          ID:props.row.ID
                                        }" @valueChanged="fillData($event)" />
              </b-table-column>
            </template>
          </b-table>
        </b-tooltip>
      </div>

      <!-- ROOT INTENTS -->

      <InputForm :data="rootIntentsList(focus.ID,selected.classification)"
        :displayNotes="displayNotes" :annualView="annualView" :details="details" :onlySum="false"
        @valueChanged="fillData($event)" type='expense' />
    </div>
    <!-- Show the following only when basic loading has finished  -->
    <div v-if="processes">
      <hr>

      <!-- Categories -->

      <b-tooltip :label="$t('help-cat-table')">
        <b-table focusable hoverable :title="$t('help-cat-table')" :data="classListData()" @select="catSelected($event)">
          <template slot-scope="props">
            <b-table-column sortable field="label" :label="$t('exp-cats')">
              {{props.row.label}}
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="january" :label="$t('january')">
              <money :locale="locale()" :amount="props.row.january" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="february"
              :label="$t('february')">
              <money :locale="locale()" :amount="props.row.february" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="march" :label="$t('march')">
              <money :locale="locale()" :amount="props.row.march" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="april" :label="$t('april')">
              <money :locale="locale()" :amount="props.row.april" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="may" :label="$t('may')">
              <money :locale="locale()" :amount="props.row.may" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="june" :label="$t('june')">
              <money :locale="locale()" :amount="props.row.june" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="july" :label="$t('july')">
              <money :locale="locale()" :amount="props.row.july" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="august" :label="$t('august')">
              <money :locale="locale()" :amount="props.row.august" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="september" :label="$t('september')">
              <money :locale="locale()" :amount="props.row.september" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="october" :label="$t('october')">
              <money :locale="locale()" :amount="props.row.october" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="november" :label="$t('november')">
              <money :locale="locale()" :amount="props.row.november" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable :visible='!annualView' field="december" :label="$t('december')">
              <money :locale="locale()" :amount="props.row.december" />
            </b-table-column>
            <b-table-column numeric :style="styleColor(props.row.label)" sortable field="annual" :label="$t('annual-sum')">
              <money :locale="locale()" :amount="props.row.annual"/>
            </b-table-column>
          </template>
        </b-table>
      </b-tooltip>

      <!-- Incomes -->

      <div v-if="!selected.classification">
        <hr>
        <InputForm :data="incomesList()" :displayNotes="displayNotes" :annualView="annualView"
          :details="details" :onlySum="false" @valueChanged="fillData($event)" type='income' />
      </div>
      <div v-if="processes.descendants && processes.descendants.length">
        <hr>

        <!-- Subactivities -->
        <b-tooltip :label="$t('sub-act-help')">
          <b-table :data="this.processes.descendants" focusable hoverable>
            <template slot-scope="props">
              <b-table-column field="name" :label="$tc('lower-activity', 1)">
                <a @click="fillData(props.row.ID)">{{props.row.name}}</a>
              </b-table-column>
              <b-table-column numeric field="iSum" :label="$tc('income',2)">
                <money :locale="locale()" :amount="props.row.iSum" />
              </b-table-column>
              <b-table-column numeric field="eSum" :label="$tc('expense',2)">
                <money :locale="locale()" :amount="props.row.eSum" />
              </b-table-column>
              <b-table-column numeric field="sum" :label="$t('annual-sum')">
                <money :locale="locale()" :amount="props.row.value" />
              </b-table-column>
            </template>
          </b-table>
        </b-tooltip>
      </div>
      <hr>
      <div v-if="!$store.state.ro">
        <ControlField @repaintChart="fillData($event)" :focus="focus"
          :cat="selected.classification" />
        <hr>
      </div>
      <p :title="$t('title-link-budget-ressource')" @click="copyClip(domain + '/load?url=' + $store.getters.ldRessource)">
        {{$t('saved')}}: <i>{{decodeURI(this.$store.getters.ldRessource)}}</i> 📋
      </p>
      <p  @click="copyClip($store.getters.budgetCategoriesUrl)">
        categories on: <i>{{$store.getters.budgetCategoriesUrl}}</i> 📋
      </p>
      <!-- <p>
        {{$t('belongs')}}: <a
          :href="this.$store.state.webId">{{decodeURIComponent(this.$store.getters.preparedFor())}}</a>
      </p> -->
      <p>
        Locale: {{$locale}}
      </p>
    </div>
  </div>
  <b-loading :is-full-page="true" :active="!loadedData && !loadError">
    <b-icon pack="fas" icon="sync-alt" size="is-large" custom-class="fa-spin">
    </b-icon>
  </b-loading>
  <mtmConsent />
</div>
</template>

<script>
/* eslint-disable no-console */

import locale2 from 'locale2'
import myMarked from 'marked'
import auth from 'solid-auth-client'
import Pie from '@/Pie.js'
import InputForm from '@/components/InputForm.vue'
import ControlField from '@/components/ControlField.vue'
import editPintModalButton from '@/components/editPintModalButton.vue'
import joinIntentsModal from '@/components/joinIntentsModal.vue'
import money from '@/components/money.vue'
import mtmConsent from '@/components/matomo-consent-banner.vue'


const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'
]

function startFromScratch() {
  // start from scratch. Set initial process name to webId Name
  this.$store.dispatch('initGraph').then(() => {
     let iniName = this.$store.getters.iniName()
     let ID = {}
     console.log('start from scratch');
     console.log(this.$store.state.webId);
     console.log(iniName);
     this.$store.dispatch('addProcess', {
       name: iniName,
       ID: ID
     })
     this.fillData()
    this.$dialog.alert(`<h1>${this.$t('welcome')} ${this.$store.state.name} 👋</h1><p>${this.$t('init-1')}<p>${this.$t('init-2')} <a target="_blank" href="https://learn.solidbase.info/en/solidbase/">learn.solidbase.info</a>`)
  })

}

export default {
  name: 'chart',
  components: {
    Pie,
    InputForm,
    ControlField,
    editPintModalButton,
    joinIntentsModal,
    money,
    mtmConsent
  },
  props: ['url'],
  data() {
    return {
      domain: process.env.VUE_APP_DOMAIN || 'https://app.solidbase.info',
      displayNotes: false,
      processes: [],
      intents: [],
      datacollection: {
        datasets: []
      },
      chartoptions: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: this.clickedChart,
        legend: {
          position: 'bottom',
          onClick: this.clickedLabel,
          labels: {
            fontSize: 16 // TODO: Might be wise to compute this from the document root font size: https://tzi.fr/js/convert-em-in-px/
          }
        },
        animation: {
          duration: 3000,
          easing: 'easeInBounce'
        },
      },
      budget: {
        data: [],
        labels: [],
        names: [],
        ressources: [],
        size: null
      },
      numberOfMembers: null,
      returnName: '',
      focus: [],
      loggedIn: false,
      annualView: true,
      details: true,
      selected: {
        name: null,
        classification: null
      },
      selectedClassText: null,
      expenseClasses: null,
      selectedClass: null,
      intentsToJoin: [],
      isJoinModalActive: false,
      exampleBudgets: [],
      selectedExampleBudget: null,
      loadError: false
    }
  },
  beforeCreate() {
    this.$locale = locale2.substr(0, 2)
    this.$store.state.locale = this.$locale
  },
  async mounted() {
    // readonly mode
    if (this.$store.state.ro) {
      this.displayNotes = true
      this.loadExampleBudgets().then(
        (folder) => {
          let url = this.url == undefined ?
            folder[folder.length-1].uri.value :
            encodeURI(this.url)
          // console.log(`loading budget from ${encodeURI(this.url)} OR ${folder[folder.length-1].uri.value}`);
          this.loadBudgetFrom(url)
        }, (err) =>
          console.log(err)
      )
    } else {
      auth.trackSession(session => {
        this.loggedIn = session
      })
      await this.$store.dispatch('trackSession').then(
        () => {
          this.$store.dispatch('loadBudgetList').then(() => {
            this.loadBudgetFrom()
          }, async failure => { // loadBudgetList wasn't successfull. ro mode
            if (failure == 'not authenticated' || failure == 'app not authenticated') {
              console.log('not authenticated')
              auth.logout()
              this.loadExampleBudgets().then(
                (folder) =>
                  this.loadBudgetFrom(folder[folder.length-1].uri.value),
                (err) =>
                  console.log(err)
              )
            } else if (failure == 'nothing saved') {
                startFromScratch.call(this)
            }
            console.log(failure)
          })
        },
        err => {
          auth.logout()
          console.log(`error while logging in: ${err}\nLoading example budgets`)
          this.loadExampleBudgets().then(
            (folder) =>
              this.loadBudgetFrom(folder[folder.length-1].uri.value),
            (err) =>
              console.log(err)
          )
        }
      )
    }
  },
  computed: {
    joiningEnabled() {
      return !this.$store.state.ro && (this.absIntents.length > 1)
    },
    loadedData() {
      if (((this.$store.state.webId && this.loggedIn) || this.url || this.exampleBudgets.length) && this.focus.ID) return true
      else return false
    },
    selectedNote() {
      let note = this.htmlNote(this.selected.ID)
      return note.length == 0 ? false : note
    },
    absIntents() {
      return this.abstractIntentsList(this.focus.ID, this.selected
        .classification)
    },
    pieStyles() {
      let width = this.$refs.pieColumn ? this.$refs.pieColumn.width : 400
      return {
        width: width,
        display: 'flex',
        'justify-content': 'center',
        position: 'relative'
      }
    }
  },
  methods: {
    copyClip(url) {
      this.$copyText(url).then(suc => {
        this.$toast.open({
          message: this.$t('copy-clip-msg') + ' ' + url,
          type: 'is-success'
        })
        console.log(suc)
      }, err => {
        this.$toast.open({
          message: 'Copy to clipboard failed',
          type: 'is-failure'
        })
        console.log(err)
      })
    },
    copyCats() {

    },
    styleColor(label) {
      let index = this.datacollection.labels.indexOf(label)
      return {'background-color':  this.datacollection.datasets[0].backgroundColor[index]}
    },
    currency() {
      return this.$store.getters.currency() ? this.$store.getters.currency().iso : null
    },
    locale() {
      return this.$store.getters.locale()
    },
    loadBudgetFrom(url) {
      console.log(`Load budget from url: ${url}`)
      this.$store.dispatch('loadBudget', url).then(
        () => {
          console.log('loaded Budget');
          this.fillData()
        },
        (err) => {
          if (err.msg) {
            this.$dialog.alert(`Budget on ${url} could not be loaded due to nonexistant expense category definitions. Please add a category for ${err.cat.split('#').pop()}`)
            this.$router.push('config')
            return false
          }
          this.$toast.open({
            message: `Budget on ${url} could not be loaded. Trying to load an example budget instead`,
            type: 'is-danger',
            duration: 3000
          })
          let exampleBudget = this.exampleBudgets[this.exampleBudgets.length-1].uri.value
          this.loadBudgetFrom(exampleBudget)
          console.log(`Couldn't load budget. Error: ${err}\nLoading now: ${exampleBudget}`)
        }
      )
    },
    async loadExampleBudgets() {
      this.$store.state.ro = true
      return new Promise(async (resolve, reject) => {
        await this.$store.dispatch('loadBudgetListFrom', this.$store.getters.exampleFolder).then(
          folder => {
            this.exampleBudgets=folder
            console.log(JSON.stringify(folder))
            resolve(folder)
          }, err => {
            console.log(`something went wrong while listing example folder: ${err}`)
            reject(err)
          }
        )
      })
    },
    catSelected(row) {
      console.log(`Selected category: ${JSON.stringify(row)}`)
      this.selected.classification = row.ressource
      this.loadText(this.selected.classification, false)
      this.fillData(this.focus.ID)
    },
    includes(ID) { // this is a doublette from inputForm
      var descs = this.$store.getters.descendants(ID)
      var pints = []
      var i, proc, procname

      for (i = 0; i < descs.length; i++) {
        proc = this.$store.getters.processOfIntent(descs[i])
        if (proc == undefined) procname = "none"
        else procname = this.$store.getters.processName(proc)
        pints.push({
          processName: procname,
          name: this.$store.getters.processName(descs[i]),
          ID: descs[i],
          processId: proc,
          value: this.$store.getters.hasValue(descs[i])
        })
      }
      this.includedIntents = pints
      return pints
    },
    htmlNote(ID) {
      let note = this.note(ID)
      return note ? myMarked(note, {
        sanitize: true
      }) : ''
    },
    note(ID) {
      let note = this.$store.getters.note(ID)
      // console.log(`note: ${note} on ID: ${ID}`)
      return note
    },
    async loadText(ressource) {
      let text = this.$store.getters.eClassText({
        ressource
      })

      console.log(`${ressource} contains:\n${JSON.stringify(text)}`);

      if (text) {
        this.selectedClassText = myMarked(text.content, {
          sanitize: true
        })
        return text.content
      }
    },
    clickedLabel(event, item) {
      console.log('clicked');
      // console.log(event);
      console.log(JSON.stringify(item,null,4));

      if (this.selected.classification) {
        this.selected.classification = null
        this.fillData(this.focus.ID)
      } else {
        this.selected.classification = this.budget.ressources[item.index]
        this.fillData(this.focus.ID)
          .then(() => this.loadText(this.selected.classification, false))
      }
    },
    clickedChart(evt, array) {
      console.log('click on chart');

      //Nothing is selected, we select a class
      if (array != undefined && array[0] && !this.selected.classification) {
        this.selected.classification = this.budget.ressources[array[0]._index]
        this.fillData(this.focus.ID)
          .then(() => this.loadText(this.selected.classification, false))
      } else { // A class is selected, we deselect all
        this.selected.classification = null
        this.fillData(this.focus.ID)
      }
    },
    rootIntentsList(ID, cat) {
      let rootIntents = []
      let intents = this.$store.getters.intentsList(ID, cat)

      intents.map(intent => {
        if (this.$store.getters.hasValue(intent.ID)!=undefined)
          rootIntents.push(intent)
      })
      return rootIntents
    },
    incomesList() {
      return this.$store.getters.intentsList(this.focus.ID, undefined, 'income')
    },
    abstractIntentsList(ID, cat) {
      let abstractIntents = []
      let intents = this.$store.getters.intentsList(ID, cat)

      intents.map(intent => {
        if (this.$store.getters.hasValue(intent.ID) == undefined) {
          let item = {}
          item.label = intent.name
          item.annual = this.$store.getters.intentValue(intent.ID)

          let monthly = this.$store.getters.intentMonthlyValues(intent.ID)
          monthly.map((value, index) => {
            item[months[index]] = value
          })

          item.ID = intent.ID

          abstractIntents.push(item)
        }
      })
      return abstractIntents
    },
    // returns a data object suitable for chart.js presentation
    classListData() {
      let data = []
      let intents

      this.expenseClasses.map(Class => {
        let item = {}
        item.ressource = Class
        item.name = Class.value.split('#').pop()

        item.label = this.$store.getters.classLabel({
          ressource: Class,
          admin: false
        })
        intents = this.$store.getters.intentsList(this.focus.ID, Class)
        let monthly = this.mSum(intents)
        monthly.map((value, index) => {
          item[months[index]] = value
        })
        item.annual = this.aSum(intents)
        if (this.$store.getters.hasCategory(Class)) data.push(item)
      })
      return data
    },
    mSum(intents) { // sums per month
      let vals = new Array(12).fill(0)
      intents.map(item => {
        let imvals = this.monthlyValues(item.ID)
        for (let i = 0; i < 12; i++) {
          vals[i] += imvals[i]
        }
      })
      // console.log(JSON.stringify(vals));
      return vals
    },
    aSum(intents) { // sum per anno
      let sum = 0
      intents.map(item =>
        sum += this.$store.getters.intentValue(item.ID)
      )
      return sum
    },
    monthlyValues(ID) {
      if (this.$store.getters.isAnnual(ID)) return new Array(12).fill(
        Math.round(this.$store.getters.intentValue(ID) / 12))
      else return this.$store.getters.intentMonthlyValues(ID)

    },
    async deleteBudget() { // TODO: copied from Controlfield, unify
      let budget = this.$store.getters.ldRessource
      this.$dialog.confirm({
        message: this.$t('confirm-delete') + ' <i>'+ budget + '</i> ?',
        onConfirm: () => {
          this.$store.dispatch('deleteRessource', budget).then(
            () => {
              this.$toast.open({
                message: this.$t('delete-success') + '<br>' + budget,
                type: 'is-success',
                duration: 3000
              })
              this.$store.dispatch('loadBudgetList').then(
                async () => {
                  await this.$store.dispatch('loadBudget')
                  this.fillData()
                },
                async () => {
                  await startFromScratch.call(this)
                })
            }, error => {
              this.$toast.open({
                message: this.$t('delete-error') + '<br>Error message: ' + error,
                type: 'is-danger',
                duration: 3000
              })
              this.fillData()
            }
          )
        }
      })
    },
    async fillData(focus) {
      if (this.loadError) this.loadError = false
      return new Promise(async (resolve) => {
        console.log('repaint chart');
        // console.log(JSON.stringify(focus));

        this.intentsToJoin = []

        if (focus == undefined) {
          focus = this.$store.getters.topProcess()
          this.selected.classification = null
        }

        this.processes = this.$store.getters.processes(focus)
        this.expenseClasses = this.$store.getters.expenseClasses({
          admin: false
        })

        if (this.processes == null && this.loggedIn) {
          this.$toast.open({
            message: "This budget contains data errors. It should be deleted now.",
            type: 'is-danger',
            duration: 3000
          })
          this.loadError = true
          await this.deleteBudget()
          return true
        }

        let expenses = this.$store.getters.intentsList(focus, this.selected.classification)
        this.budget.iSum = this.$store.getters.incomeSum(focus)

        this.focus = this.processes.focus[0]
        this.numberOfMembers = this.$store.getters.numberMembers()

        // if a expense class is selected, display its containing expenses.
        // else display the (annual) sums of the categories and the incomes
        if (!this.selected.classification) {
          this.budget.labels = []
          this.budget.ressources = []
          this.classListData().map(item => {
            this.budget.labels.push(item.label)
            this.budget.ressources.push(item.ressource)
          })
          this.budget.data = this.$store.getters.expCatTotalList(focus, this.budget.ressources)
        } else {
          this.budget.labels = expenses.map(a => a.name)
          this.budget.data = this.$store.getters.intentsTotalList(focus, this.selected
            .classification)
        }
        console.log(`LDResource: ${this.$store.state.ldRessource}`)
        console.log(`focus: ${focus}`);
        console.log(`budget.labels:\n${JSON.stringify(this.budget.labels, null, 4)}`)
        console.log(`budget.data:\n${JSON.stringify(this.budget.data, null,4)}`)

        this.budget.eSum = this.budget.data.reduce((a, b) => a + b, 0)
        this.budget.size = this.budget.eSum - this.budget.iSum

        let colors = this.budget.data.map(() =>
            `hsl(${Math.random()*360}, ${Math.random()*100}%,75%)`
        )

        this.datacollection = {
          labels: this.budget.labels,
          datasets: [{
            label: 'SolidBase budgeting',
            backgroundColor: colors,
            borderColor: 'rgba(255,99,132,1)',
            pointBackgroundColor: 'rgba(255,99,132,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255,99,132,1)',
            data: this.budget.data,
          }]
        }
        console.log('filldata:');
        console.log('datacollection:\n' + JSON.stringify(this.datacollection))
        console.log(JSON.stringify(this.chartoptions));
        resolve()
        // TODO: make this auto scrolling more smart
        // var elmnt = document.getElementById("head")
        // elmnt.scrollIntoView()
      })
    }
  }
}

/* eslint-enable no-console */
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
}

.Chart {
  padding: 20px;
  box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, .4);
  border-radius: 20px;
  margin: 50px 0;
}
</style>
