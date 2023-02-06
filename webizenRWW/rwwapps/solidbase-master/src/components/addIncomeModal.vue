<template>
<div class="modal-card" style="width: auto">
  <header class="modal-card-head">
    <p class="modal-card-title">{{$t('add-income')}}</p>
  </header>
  <section class="modal-card-body">
    <b-field :label="$t('name')">
      <b-input v-model="income.name" :placeholder="$t('enter-inc-name')" ref="nameInput"/>
    </b-field>
    <div v-if="showMonths">
      <b-field v-for="month in months" :key="month.name"
        :label="$t(month.name.toLowerCase())" horizontal
        style="display:-webkit-box;text-align:right;margin-bottom:0rem;">
        <b-numberinput v-model="month.value" :step="$store.getters.stepValue()" @keyup.native.enter="addIncome()"
          controls-position="compact" controls-rounded style="display:inline-flex;"/>
      </b-field>
    </div>
    <div v-else>
      <b-field :label="$t('annually')" style="display:block;" :message="$store.getters.currency().iso">
        <b-numberinput v-model.number="income.value" :step="$store.getters.stepValue()" @keyup.native.enter="addIncome()"
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
    <button class="button is-success is-rounded" @click="addIncome()">
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


export default {
  name: 'addIncomeModal',
  props: ['focus'],
  data: function() {
    return {
      income: {
        value: 0,
        name: ''
      },
      returnProcess: this.focus.ID,
      IntInc: null, // include the new intent into
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
      input: null,
      parentIntents: null
    }
  },
  components: {
    ProcessSelector,
    IntentSelector,
  },
  computed: {
    compiledMarkdown() {
      return this.input ? myMarked(this.input, {
        sanitize: true
      }) : ''
    },
  },
  mounted() {
    this.$refs.nameInput.focus()
  },
  methods: {
    newParentProcess(proc) {
      this.returnProcess = proc
    },
    async addIncome() {
      let ID = {}
      let incomes = this.$store.getters.incomes(this.returnProcess) // sibling incomes
      let incomeNames = incomes.map(a => this.$store.getters.processName(a))

      if (incomeNames.indexOf(this.income.name) != -1) {
        this.$toast.open({
          message: this.$t('no-double-exp'),
          type: 'is-danger',
          duration: 3000
        })
        console.log('name test failed');
        return false
      }
      if (this.income.value == 0 && this.aSum() == 0) {
        this.$toast.open({
          message: this.$t('no-null'),
          type: 'is-danger',
          duration: 3000
        })
        console.log('null test failed');
        return false
      }

      if (this.returnProcess == null) this.returnProcess = this.focus.ID
      if (!this.showMonths) {
        this.$store.dispatch('createIntent', {
          name: this.income.name,
          value: this.income.value,
          ID: ID
        })
      } else {
        this.$store.dispatch('createIntent', {
          name: this.income.name,
          ID: ID,
          months: this.months
        })
      }
      await this.$store.dispatch('addIncomeId', {
        incomeId: ID.value,
        processId: this.returnProcess
      })

      if (this.input != null) {
        this.$store.dispatch('changeNote', {
          ID: ID.value,
          newNote: this.input
        })
      }

      this.$emit('repaintChart', this.returnProcess)
      this.$parent.close()
    },
    aSum() {
      return this.months.map(a => parseFloat(a.value)).reduce((a, b) => a + b, 0)
    },
    togglePeriod() {
      this.showMonths = !this.showMonths
      if (this.showMonths && this.income.value > 0) {
        for (var i = 0; i < 12; i++) {
          if (this.$store.state.decimals) this.months[i].value = Math.round((this.income.value / 12)*100)/100
          else this.months[i].value = Math.round(this.income.value / 12)
        }
      } else {
        this.income.value = this.aSum()
      }
    },
    update(e) {
      this.input = e.target.value
    }
  }
}
</script>
