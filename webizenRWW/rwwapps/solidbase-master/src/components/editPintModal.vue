<template>
<div class="modal-card" style="width: auto">
  <header class="modal-card-head">
    <p class="modal-card-title">{{$t('edit-props')}}
      {{type == 'process' ? $t('activity') : $tc('expense',1)}} {{label}}.</p>
  </header>

  <section class="modal-card-body">
    <b-tabs expanded v-model="activeTab">
      <b-tab-item :label="$t('properties')">
        <b-field :label="$t('name')">
          <b-input v-model="returnLabel"></b-input>
        </b-field>

        <div v-if="relChange">
          <ProcessSelector :currentProc="parentProcess()" :exclude="excludedProcesses()"
            @input="newParentProcess($event)" />
        </div>

        <b-field v-if="type!='process' && !$store.getters.hasIncludes(ID)" :label="$t('sel-cat')">
          <ClassSelector :classes="expenseClasses" :currentClass="classification(ID)"
            :localize='true' @input="expenseClass=$event" />
        </b-field>

        <!-- <b-field v-if="type=='process'" :label="$t('sel-class')">
          <ClassSelector :classes="this.processClasses" :currentClass="this.processClass"
            @input="processClass=$event" />
        </b-field> -->

        <p><b>{{$t('edit-note')}}</b></p>
        <div id="editor">
          <textarea :value="input" @input="update"></textarea>
          <div v-html="compiledMarkdown"></div>
        </div>
      </b-tab-item>
      <b-tab-item v-if="type!='process' && $store.getters.hasValue(ID) != undefined" :label="$tc('amount', 2)">
        <section v-if="activeTab==1">
          <div class="columns">
            <div class="column is-one-quarter">
              <b-field :message="$t('monthly-values')">
                <b-switch :value="$store.getters.months(ID).length > 0 ? true : false"
                  @input="toggleAnnuality()" />
              </b-field>
            </div>
            <div class="column is-three-quarters">
              <div v-if="$store.getters.months(ID)">
                <b-field v-for="month in $store.getters.months(ID)" :key="month.ID.value"
                  :label="$t(month.name.toLowerCase())" horizontal
                  style="display:-webkit-box;text-align:right;margin-bottom:0rem;">
                  <b-numberinput @input="monthlyValueChanged(ID,month)" v-model="month.value" :step="$store.getters.stepValue()"
                    controls-position="compact" controls-rounded style="display:inline-flex;" min="0" max="10000000"/>
                </b-field>
              </div>
              <div v-else-if="intentValue != undefined">
                <b-field :label="$t('annually')" horizontal
                  style="display:-webkit-box;text-align:right;">
                  <b-numberinput v-model="intentValue" :step="$store.getters.stepValue()" @input="valueChanged()"
                    controls-position="compact" controls-rounded min="0" max="10000000"
                    style="display:inline-flex;" />
                </b-field>
              </div>
              <div v-else>
                <!-- TODO: Test if necessary -->
                {{$t('inc-sum-up')}}
                {{ $n($store.getters.intentValue(ID), 'currency')}}
              </div>
            </div>
          </div>
        </section>
      </b-tab-item>
    </b-tabs>
  </section>
  <footer class="modal-card-foot" style="justify-content:space-between">
    <button class="button is-success is-rounded" @click="save()">
      <span class="icon is-small">
        <i class="fas fa-check"></i>
      </span>
      <span>{{$t('save')}}</span>
    </button>
    <div v-if="type!='process' && !$store.getters.hasIncludes(ID)">
      <button class="button is-danger is-rounded" @click="deleteIntent()">
        <span class="icon is-small">
          <i class="fas fa-times"></i>
        </span>
        <span>{{$t('delete')}}</span>
      </button>
    </div>
    <div v-if="this.type=='process'">
      <button class="button is-danger is-rounded" @click="deleteProcess()">
        <span class="icon is-small">
          <i class="fas fa-times"></i>
        </span>
        <span>{{$t('delete')}}</span>
      </button>
    </div>
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
/* eslint-disable no-console*/
import myMarked from 'marked'
import ProcessSelector from '@/components/ProcessSelector.vue'
import IntentSelector from '@/components/IntentSelector.vue'
import ClassSelector from '@/components/ClassSelector.vue'

// multi (Pint = Process & INTent) edit button
// this should be refactored to ~4 different components:
// - editProcess
// - non -abstract intent
// - abstract intent
// - second level intent
export default {
  name: 'editPintModal',
  props: ['type', 'label', 'ID'],
  data: function() {
    return {
      activeTab: 0,
      expenseClasses: this.$store.getters.expenseClasses({
        admin: false
      }),
      processClasses: this.$store.state.processClasses,
      processClass: null,
      expenseClass: this.$store.getters.classification(this.ID),
      returnProcess: null,
      returnLabel: this.label,
      input: this.note(),
      intentValue: this.$store.getters.hasValue(this.ID),
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
      ]
    }
  },
  components: {
    ProcessSelector,
    IntentSelector,
    ClassSelector
  },
  mounted() {
    this.input = this.note()
    this.expenseClass = this.classification()
  },
  computed: {
    relChange: function() { // Is it allowed to change the process this Pint is related to?
      if ((this.ID == this.$store.getters.topProcess()) ||
        (this.$store.getters.allProcesses.length == 0) ||
        (this.type != 'process' && this.$store.getters.hasIncludes(this.ID)))
        return false
      else if (this.$store.getters.ascendants(this.ID).length > 0) return true

      return true
    },
    compiledMarkdown: function() {
      return this.input ? myMarked(this.input, {
        sanitize: true
      }) : ''
    },
    nextLabel: function() {
      if (this.returnLabel != this.label) return this.returnLabel
      else return null
    }
  },
  methods: {
    parentProcess() {
      let processID
      if (this.type != 'process') {
        processID = this.$store.getters.processOfIntent(this.ID)
      } else {
        processID = this.$store.getters.ascendants(this.ID)[0]
      }
      return processID
    },
    note() {
      var note = this.$store.getters.note(this.ID)
      console.log('note: ' + note);
      return note == undefined ? "" : note
    },
    classification() {
      var classification = this.$store.getters.classification(this.ID)
      console.log('class: ' + classification)
      return classification == undefined ? "" : classification
    },
    deleteIntent() {
      let zoom = this.parentProcess()
      this.$store.dispatch('destroyIntent', this.ID)
      this.$emit('valueChanged', zoom)
      this.$parent.close()
    },
    deleteProcess() {
      console.log(`deleting: ${this.ID.value}`);
      if (this.ID.value == this.$store.getters.topProcess().value) {
        this.$toast.open({
          message: this.$t('delete-error-main-process'),
          type: 'is-danger',
          duration: 3000
        })
        return false
      }
      this.$store.dispatch('deleteProcess', {
        proc: this.ID,
        destroy: false
      })
      this.$emit('valueChanged', this.parentProcess())
      this.$parent.close()
    },
    excludedProcesses() {
      var procs = []
      procs.push(this.ID)
      var allprocs = procs.concat(this.$store.getters.lowerProcesses(this.ID))
      console.log('exclude:\n' + JSON.stringify(allprocs))
      return allprocs
    },
    monthlyValueChanged(intent, month) {
      let value = typeof(month.value) == 'number' ? month.value : 0

      // console.log(JSON.stringify(month,null,4));
      this.$store.commit('changeMonthlyValue', {
        ID: month.ID,
        value
      })
    },
    valueChanged() {
      let value = typeof(this.intentValue) == 'number' ? this.intentValue : 0

      this.$store.commit('changeIntentValue', {
        ID: this.ID,
        value
      })
    },
    newParentProcess(newProcess) {
      console.log('newParentProcess');
      this.returnProcess = newProcess
    },
    async save() {
      let focusProcess = (this.type != 'process') ? this.parentProcess() : this.ID

      if (this.relChange) { //change relation
        if (this.type != 'process') {
          console.log(this.returnProcess)
          console.log(this.ID)
          if (this.returnProcess != null) { // move intent to other process
            await this.$store.dispatch('removeIntent', this.ID)
            this.$store.dispatch('addExpenseId', {
              intentId: this.ID,
              processId: this.returnProcess
            })
            console.log('newParentProcess ' + this.ID)
          }
        } else if (this.returnProcess != null) { // move process to other process
          await this.$store.dispatch('moveProcess', {
            proc: this.ID,
            nproc: this.returnProcess
          })
        }
      }
      if (this.nextLabel != null) {
        let expenses = this.$store.getters.expenses(this.$store.getters.processOfIntent(this.ID))
          .map(exp => this.$store.getters.processName(exp)) // sibling intents

        console.log(`siblings: ${expenses}`);
        console.log('changeLabel to');
        console.log(this.nextLabel);
        console.log(this.ID);

        if (this.type == 'process' &&
            this.$store.getters.allProcesses().map(a => a.name).includes(this.nextLabel)) {
          console.log('Process Name already chosen');
          this.$toast.open({
            message: this.$t('no-double-cat'),
            type: 'is-danger',
            duration: 3000
          })
          return false
        }
        if (expenses.includes(this.nextLabel)) {
          this.$toast.open({
            message: this.$t('rename-exp-err'),
            type: 'is-danger',
            duration: 3000
          })
          return false
        }
        this.$store.dispatch('changeLabel', {
          ID: this.ID,
          newName: this.nextLabel
        })
      }


      if (this.input != this.note()) {
        this.$store.dispatch('changeNote', {
          ID: this.ID,
          newNote: this.input
        })
      }
      // console.log(
      //   `change class from ${this.processClass || this.expenseClass} to ${this.classification()}`
      // );

      if (this.type == 'process' &&
        this.processClass != this.classification() &&
        this.processClass) {
        this.$store.dispatch('changeClass', {
          ID: this.ID,
          newClass: this.processClass
        })
      }
      if (this.type != 'process' &&
        this.expenseClass != this.classification() &&
        this.expenseClass) {
        this.$store.dispatch('changeClass', {
          ID: this.ID,
          newClass: this.expenseClass
        })
      }
      console.log('refocus ' + focusProcess);
      console.log(JSON.stringify(this.ID));
      this.$emit('valueChanged', focusProcess)
      this.$parent.close()
    },
    async toggleAnnuality() {
      if (!this.$store.getters.months(this.ID)) {
        this.$dialog.confirm({
          message: this.$t('confirm-split'),
          onConfirm: () => {
            //remove value from intent
            var value = this.$store.getters.hasValue(this.ID)
            this.$store.dispatch('removeValues', this.ID)
            //add value/12 as monthly values for intent
            for (var i = 0; i < 12; i++) {
              if (this.$store.state.decimals) this.months[i].value = Math.round((value / 12)*100)/100
              else this.months[i].value = Math.round(value / 12)
            }
            this.$store.commit('addMonthlyValues', {
              ID: this.ID,
              months: this.months
            })
            this.$emit('toggleAnnualView', false)
            // this.$emit('valueChanged', this.parentProcess)
            this.activeTab = 0 // poor mans tab reload ;)
            this.activeTab = 1

            // this.$parent.close()
          }
        })
      } else {
        this.$dialog.confirm({
          message: this.$t('confirm-combine'),
          onConfirm: () => {
            // remove monthly values
            var value = this.$store.getters.months(this.ID).map(a => parseFloat(a.value))
              .reduce((a, b) => a + b, 0)
            this.$store.dispatch('removeValues', this.ID)
            // add annual value
            this.$store.commit('addAnnualValue', {
              ID: this.ID,
              value
            })
            this.$emit('toggleAnnualView', true)
            // this.$emit('valueChanged', this.parentProcess())
            this.intentValue = this.$store.getters.intentValue(this.ID)
            this.activeTab = 0
            this.activeTab = 1

            // this.$parent.close()
          }
        })
      }
    },
    update(e) {
      this.input = e.target.value
    }
  }
}
</script>

<style >
textarea {
  border: none;
  width: 100%;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: 'Monaco', courier, monospace;
}
</style>
