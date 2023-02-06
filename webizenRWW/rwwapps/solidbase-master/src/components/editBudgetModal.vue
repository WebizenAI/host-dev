<template>
    <div class="modal-card" style="width: auto"  @keyup.enter.capture="save()">
        <header class="modal-card-head">
            <p class="modal-card-title">{{$t('edit-meta-data')}}</p>
        </header>
        <section class="modal-card-body">
          <b-field horizontal style="display: flex;">
            <b-field :message="$t('private')" style="text-align: left;">
              <b-switch v-model="privateStatus"/>
            </b-field>
            <b-field v-if="showCancel && $store.state.admin && !privateStatus" :message="$t('example')" style="text-align: left;">
              <b-switch v-model="isOnAdminPod"/>
            </b-field>
            <b-field :message="$t('use-decimals')" style="text-align: left;">
              <b-switch v-model="decimals"/>
            </b-field>
          </b-field>
          <b-field label="Name">
                <b-input v-model="returnLabel"></b-input>
          </b-field>
          <b-field :label="$t('select-year')">
            <b-select  v-model="selectedYear">
                <option
                    v-for="year in years"
                    :value="year"
                    :key="year">

                    {{ year }}
                </option>
            </b-select>
          </b-field>
          <b-field :label="$t('amount-members')">
            <b-numberinput  v-model.number="numberMembers"
                      controls-position="compact" controls-rounded
                      min="0"
                      max="10000"
                      style="display:inline-flex;"/>
          </b-field>
          <b-field :label="$t('select-currency')">
            <b-select  v-model="selectedCurrency">
                <option
                    v-for="curr in currencies"
                    :value="curr.name"
                    :key="curr.iso">

                    {{ curr.iso }}
                </option>
            </b-select>
          </b-field>
        </section>
        <footer class="modal-card-foot" style="justify-content:space-between">
          <button class="button is-success is-rounded" @click="save()">
            <span class="icon is-small">
              <i class="fas fa-check"></i>
            </span>
            <span>{{$t('save')}}</span>
          </button>
          <button v-if="showCancel" class="button is-warning is-rounded" @click="$parent.close()">
            <span class="icon is-small">
              <i class="fas fa-times"></i>
            </span>
            <span>{{$t('cancel')}}</span>
          </button>
        </footer>
        <div>
          <b-loading :is-full-page="true" :active="loading">
            <b-icon pack="fas" icon="sync-alt" size="is-large" custom-class="fa-spin">
            </b-icon>
          </b-loading>
        </div>

    </div>
</template>

<script>
/* eslint-disable no-console*/

export default {
  name: 'editBudgetModal',
  props: {showCancel: {
            default: true,
            type: Boolean
            }
          } ,
  data: function () {
    return {
      returnLabel: this.$store.getters.iniName(),
      numberMembers:  this.$store.getters.numberMembers(),
      selectedCurrency: this.$store.getters.currency() ? this.$store.getters.currency().name: null,
      selectedYear: this.$store.getters.budgetYear(),
      privateStatus: this.$store.getters.privateStatus,
      isOnAdminPod: this.$store.getters.isOnAdminPod,
      decimals: this.$store.state.decimals,
      loading: false
    }
  },
  async beforeCreate() {
    await this.$store.dispatch('loadBudgetListFrom', this.$store.getters.exampleFolder).then(
      folder => {
        this.exampleBudgets=folder
        // console.log(`Contents of example folder: ${JSON.stringify(folder, null, 4)}`)
      }, err => {
        console.log(`something went wrong while listing example folder: ${err}`)
      }
    )
  },
  computed: {
    decimalStatus() {
      return this.$store.state.decimals
    },
    currencies() { // TODO. should be changed to a SPARQL query to QUDT
      return this.$store.state.currencies
    },
    years() {
      var list=[]
      var thisYear=(new Date()).getFullYear()

      for (var i=0;i<15;i++){
        list[i]=thisYear-10+i
      }
      return list
    }
  },
  methods: {
    async save() {
      this.loading=true
      let focus
      // console.log('editBudgetModal:');
      // console.log(`${this.selectedCurrency}\n${JSON.stringify(this.$store.getters.currency(), null, 4)}`);

      if (this.$store.getters.topProcess() == undefined) {
        await this.$store.dispatch('addProcess', {
          name: this.returnLabel,
        })
      }
      if (this.returnLabel!= this.$store.getters.iniName()) {
        this.$store.dispatch('changeIniName', this.returnLabel)
      }
      if (this.numberMembers != this.$store.getters.numberMembers()) {
        this.$store.dispatch('changeMembersNumber', this.numberMembers)
      }
      if (this.selectedCurrency != this.$store.getters.currency().name) {
        this.$store.dispatch('changeCurrency', this.selectedCurrency)
      }
      if (this.selectedYear != this.$store.getters.budgetYear()) {
        this.$store.dispatch('changeYear', this.selectedYear)
      }
      if (this.privateStatus != this.$store.getters.privateStatus) {
        console.log('Changing private status to: ' + this.privateStatus)
        await this.$store.dispatch('togglePrivateMode', this.privateStatus)
        focus = this.$store.getters.topProcess()
      }
      if (this.decimals != this.decimalStatus) {
        // console.log(this.$store.getters.stepValue());
        console.log(`Changing display of decimals to: ${this.decimals}`)
        if (this.decimals) await this.$store.dispatch('changeStepValue', 0.01)
        else await this.$store.dispatch('changeStepValue', 1)

      }

      if (!this.privateStatus && (this.isOnAdminPod != this.$store.getters.isOnAdminPod)) {
        console.log('Changing example status')
        await this.$store.dispatch('toggleExampleStatus', this.isOnAdminPod)
      }
      this.loading=false
      this.$parent.close()
      this.$emit('repaintChart', focus)
    }
  }
}
</script>
