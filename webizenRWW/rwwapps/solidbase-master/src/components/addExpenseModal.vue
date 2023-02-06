<template>
<div class="modal-card" style="width: auto">
  <header class="modal-card-head">
    <p class="modal-card-title">{{$t('add-expense')}}</p>
  </header>
  <section class="modal-card-body">
    <b-field :label="$t('sel-cat')">
      <ClassSelector :classes="expenseClasses" :currentClass="cat" :localize='true'
        @input="expenseClass=$event; setParentIntents()"/>
    </b-field>
    <b-field :label="$t('name')">
      <b-autocomplete v-model="intentName" :data="filteredParentIntents"
        :placeholder="$t('enter-exp-name')" />
    </b-field>
    <div v-if="showMonths">
      <b-field v-for="month in months" :key="month.name"
        :label="$t(month.name.toLowerCase())" horizontal
        style="display:-webkit-box;text-align:right;margin-bottom:0rem;">
        <b-numberinput v-model="month.value" :step="$store.getters.stepValue()" @keyup.native.enter="saveIntent()"
          controls-position="compact" controls-rounded style="display:inline-flex;"/>
      </b-field>
    </div>
    <div v-else>
      <b-field :label="$tc('amount', 1)"  margin-bottom="-22px" :message="$store.getters.currency().iso">
        <b-numberinput v-model.number="intentValue" :step="$store.getters.stepValue()"  @keyup.native.enter="saveIntent()"
          controls-position="compact" controls-rounded min="0" max="10000000"
          style="display:inline-flex;" />
      </b-field>
    </div>
    <ProcessSelector :currentProc="this.focus.ID" @input="newParentProcess($event)" />
    <p><b>{{$t('edit-note')}}</b></p>
    <div id="editor">
      <textarea :value="input" @input="update"></textarea>
      <div v-html="compiledMarkdown"></div>
    </div>
  </section>
  <footer class="modal-card-foot" style="justify-content:space-between">
    <button class="button is-success is-rounded" @click="saveIntent()">
      <span class="icon is-small">
        <i class="fas fa-check"></i>
      </span>
      <span>{{$t('add')}}</span>
    </button>
    <button class="button is-warning is-rounded" @click="togglePeriod()">
      <span>{{ showMonths ? $t('annual-values') : $t('monthly-values') }}</span>
    </button>
    <button class="button is-warning is-rounded" @click="$parent.close()">
      <span class="icon is-small">
        <i class="fas fa-times"></i>
      </span>
      <span>{{$t('cancel')}}</span>
    </button>
  </footer>
</div>
</template>

<script>
/* eslint-disable no-console */

import myMarked from 'marked'
import ProcessSelector from '@/components/ProcessSelector.vue'
import IntentSelector from '@/components/IntentSelector.vue'
import ClassSelector from '@/components/ClassSelector.vue'


export default {
  name: 'addExpenseModal',
  props: ['focus', 'cat'],
  data: function() {
    return {
      intentValue: 0,
      intentName: '',
      returnProcess: this.focus.ID,
      showMonths: false, // annual view
      months: [{
          name: 'January',
          value: 0
        },
        {
          name: 'February',
          value: 0
        },
        {
          name: 'March',
          value: 0
        },
        {
          name: 'April',
          value: 0
        },
        {
          name: 'May',
          value: 0
        },
        {
          name: 'June',
          value: 0
        },
        {
          name: 'July',
          value: 0
        },
        {
          name: 'August',
          value: 0
        },
        {
          name: 'September',
          value: 0
        },
        {
          name: 'October',
          value: 0
        },
        {
          name: 'November',
          value: 0
        },
        {
          name: 'December',
          value: 0
        }
      ],
      expenseClasses: this.$store.getters.expenseClasses({
        admin: false
      }),
      expenseClass: this.cat || this.$store.getters.expenseClasses({
        admin: false
      })[0],
      input: null,
      parentIntents: null
    }
  },
  components: {
    ProcessSelector,
    IntentSelector,
    ClassSelector
  },
  computed: {
    compiledMarkdown() {
      return this.input ? myMarked(this.input, {
        sanitize: true
      }) : ''
    },
    filteredParentIntents() {
      if (!this.parentIntents) return []
      return this.parentIntents.filter((option) => {
        return option
          .toString()
          .toLowerCase()
          .indexOf(this.intentName.toLowerCase()) >= 0
      })
    }
  },
  mounted() {
    this.setParentIntents(this.$store.getters.expenseClasses({})[0])
  },
  methods: {
    // get possible expense names for sutocomplete
    setParentIntents(cat) {
      cat = cat || this.expenseClass
      let parentProcesses = this.$store.getters.ascendants(this.focus.ID)
      let intents = this.$store.getters.intentsList(this.focus.ID, cat).map(intent => intent.name)

      // console.log(cat);
      // console.log(this.focus.ID.value);
      // console.log(JSON.stringify(parentProcess))

      if (parentProcesses.length) {
        this.parentIntents = this.$store.getters.intentsList(parentProcesses[0], cat)
          .filter(intent => this.$store.getters.hasIncludes(intent.ID))
          .map(intent => intent.name)
          .filter(intent => !intents.includes(intent))
      }
    },
    newParentProcess(proc) {
      this.returnProcess = proc
    },
    async saveIntent() {
      let ID = {}
      let intents = this.$store.getters.expenses(this.returnProcess) // sibling intents
      let intentNames = intents.map(a => this.$store.getters.processName(a))

      if (intentNames.indexOf(this.intentName) != -1) {
        this.$toast.open({
          message: this.$t('no-double-exp'),
          type: 'is-danger',
          duration: 3000
        })
        console.log('name test failed');
        return false
      }
      if (this.intentValue == 0 &&
        this.months.map(a => parseFloat(a.value)).reduce((a, b) => a + b, 0) == 0) {
        this.$toast.open({
          message: this.$t('no-null'),
          type: 'is-danger',
          duration: 3000
        })
        console.log('null test failed');
        return false
      }
      if (this.expenseClass == null) {
        this.$toast.open({
          message: this.$t('plz-sel-exp-cat'),
          type: 'is-danger',
          duration: 3000
        })
        console.log('class test failed');
        return false
      }

      if (this.returnProcess == null) this.returnProcess = this.focus.ID
      if (!this.showMonths) {
        this.$store.dispatch('createIntent', {
          name: this.intentName,
          value: this.intentValue,
          ID: ID
        })
      } else {
        this.$store.dispatch('createIntent', {
          name: this.intentName,
          ID: ID,
          months: this.months
        })
      }

      await this.$store.dispatch('addExpenseId', {
        intentId: ID.value,
        processId: this.returnProcess
      })

      if (this.input != null) {
        this.$store.dispatch('changeNote', {
          ID: ID.value,
          newNote: this.input
        })
      }

      this.$store.dispatch('changeClass', {
        ID: ID.value,
        newClass: this.expenseClass
      })

      this.$emit('repaintChart', this.returnProcess)
      this.$parent.close()
    },
    togglePeriod() {
      this.showMonths = !this.showMonths
      if (this.showMonths && this.intentValue > 0) {
        for (var i = 0; i < 12; i++) {
          if (this.$store.state.decimals) this.months[i].value = Math.round((this.intentValue / 12)*100)/100
          else this.months[i].value = Math.round(this.intentValue / 12)
        }
      } else {
        this.intentValue = this.months.map(a => parseFloat(a.value))
          .reduce((a, b) => a + b, 0)
      }
    },
    update(e) {
      this.input = e.target.value
    }
  }
}
</script>
