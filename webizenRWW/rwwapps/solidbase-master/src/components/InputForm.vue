<template>
<section v-if="data.length">
  <h4 v-if="!onlySum">{{groupName}}</h4>
  <b-field v-if="type!='process'">
    <table class="table">
      <thead>
        <tr>
          <th>{{ type =='expense' ? $t('act-costs') : $t('act-income') }}</th>
          <th v-if="!annualView"
            v-for="month in [$t('january'), $t('february'), $t('march'), $t('april'), $t('may'), $t('june'), $t('july'),$t('august'), $t('september'), $t('october'), $t('november'), $t('december') ]"
            :key="month">
            {{ month }}
          </th>
          <th>
            {{ $t('annual-sum') }}
          </th>
          <th v-if="displayNotes">
            {{ $t('notes') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!onlySum" v-for="(item) in data" :key="item.ID.value">
          <th>{{item.name}}</th>
          <td
            v-if="!annualView &&
                      (displayValue(item) || (carriedValue(item.ID) != undefined && $store.getters.isAnnual(item.ID)))"
            v-for="(month, ndex) in monthlyValues(item.ID)" :key="ndex">
             <money :locale="locale()" :amount="month"/>
          </td>
          <td
            v-if="!annualView && !$store.getters.isAnnual(item.ID)  && !$store.getters.hasIncludes(item.ID)"
            v-for="(month,dex) in months(item.ID)" :key="dex">
              <b-input v-if="!$store.state.ro" @input="monthlyValueChanged(item.ID, month)" v-model.number="month.value"
                type="number" min="0" max="10000000" :step="$store.getters.stepValue()"
                style="display: inline-block;max-width:110px;min-width:75px;" />
              <span v-else>
                <money :locale="locale()" :amount="month.value"/>
              </span>
          </td>
          <td>
            <div v-if="type == 'expense' && !$store.state.ro && ($store.getters.hasIncludes(item.ID) || !$store.getters.isAnnual(item.ID))">
              <money :locale="locale()" :amount="annualValue(item.ID)"/>
            </div>
            <div v-if="(carriedValue(item.ID) != undefined) && !$store.getters.months(item.ID) && !$store.state.ro">
              <b-input @input="valueChanged(item)" v-model.number="item.value" type="number" min="0" :step="$store.getters.stepValue()"
                max="10000000" style="display: inline-block;max-width:110px;min-width:75px;" />
            </div>
            <div
              v-else-if="((carriedValue(item.ID) != undefined) && $store.getters.months(item.ID) && $store.getters.hasIncludes(item.ID))
                         || (type =='income' && $store.getters.months(item.ID))
                         || $store.state.ro
                         ">
              <money :locale="locale()" :amount="$store.getters.hasValue(item.ID)"/>
            </div>
          </td>
          <td v-if='displayNotes'>
            <span v-html='htmlNote(item.ID)' />
          <td>
              <editPintModalButton v-if="!$store.state.ro" :type="type" :item="item"
                @valueChanged="$emit('valueChanged',$event)" />
          </td>
        </tr>
      </tbody>
    </table>
  </b-field>
</section>
</template>

<script>
/* eslint-disable no-console */
//TODO: refactor to b-table

import myMarked from 'marked'
import editPintModalButton from '@/components/editPintModalButton.vue'
import IntentSelector from '@/components/IntentSelector.vue'
import money from '@/components/money.vue'

export default {
  name: 'InputForm',
  props: ['data', 'type', 'groupName', 'displayNotes', 'annualView', 'details', 'onlySum'],
  components: {
    editPintModalButton,
    IntentSelector,
    money
  },
  data: function() {
    return {
      label: null,
      value: null,
      ID: null,
      processName: null,
      returnValue: this.value,
      returnLabel: this.label,
    }
  },
  methods: {
    locale() {
      return this.$store.getters.locale()
    },
    htmlNote(item) {
      console.log(this.note(item));
      return this.note(item) ? myMarked(this.note(item), {
        sanitize: true
      }) : ''
    },
    note(item) {
      var note = this.$store.getters.note(item)
      // console.log('note:');
      // console.log(note);
      // console.log(JSON.stringify(item));
      return note == undefined ? "" : note
    },
    valueChanged(item) {
      if (typeof(item.value) == 'number') {
        this.$store.commit('changeIntentValue', {
          ID: item.ID,
          value: item.value
        })
        this.$emit('valueChanged', this.$store.getters.processOfIntent(item.ID))
      }
    },
    monthlyValueChanged(intent, month) {
      // console.log(JSON.stringify(month, null, 4));
      if (typeof(month.value) == 'number') {
        this.$store.commit('changeMonthlyValue', {
          ID: month.ID,
          value: month.value
        })
        this.$emit('valueChanged', this.$store.getters.processOfIntent(intent))
      }
    },
    displayValue(item) { // display  value
      return (this.type == 'process') ||
        (this.$store.getters.hasIncludes(item.ID)) ||
        (this.annualView && !this.$store.getters.isAnnual(item.ID))
    },
    carriedValue(ID) { // display inputField
      return this.$store.getters.hasValue(ID)
    },
    months(ID) {
      return this.$store.getters.months(ID)
    },
    monthlyValues(ID) {
      if (this.$store.getters.isAnnual(ID))
        return new Array(12).fill(
          this.$store.state.decimals ? Math.round((this.$store.getters.intentValue(ID) / 12)*100)/100
            : Math.round(this.$store.getters.intentValue(ID) / 12)
      )
      else return this.$store.getters.intentMonthlyValues(ID)
    },
    annualValue(ID) {
      return this.$store.getters.intentValue(ID)
    }
  }
}
</script>
