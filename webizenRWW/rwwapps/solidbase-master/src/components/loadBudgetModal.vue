<template>
    <div class="modal-card" style="width: auto" @keyup.enter.capture="loadBudget()">
        <header class="modal-card-head">
            <p class="modal-card-title">{{$t('load-budget')}}</p>
        </header>
        <section class="modal-card-body">
          <b-field :label="$t('from-pod')" :message="$t('from-pod-msg')">
            <b-select  v-model="selectedBudget" ref="budgetList" @input="selectedExampleBudget=null">
                <option
                    v-for="budget in $store.state.budgetList"
                    :value="budget"
                    :key="budget.value">

                    {{$store.getters.budgetName(budget)}}
                </option>
            </b-select>
          </b-field>
          <b-field :label="$t('from-examples')" :message="$t('from-examples-msg')">
            <b-select  v-model="selectedExampleBudget" @input="selectedBudget=null">
                <option
                    v-for="budget in exampleBudgets"
                    :value="budget"
                    :key="budget.value">

                    {{$store.getters.budgetName(budget)}}
                </option>
            </b-select>
          </b-field>

          <b-field :label="$t('from-iri')">
            <b-input  v-model="foreignBudget"
                      :placeholder="$t('enter-iri')">
            </b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success is-rounded" @click="loadBudget()">
              <span class="icon is-small">
                <i class="fas fa-check"></i>
              </span>
              <span>{{$t('load')}}</span>
          </button>
          <button class="button is-warning is-rounded" @click="$parent.close()">
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
/* eslint-disable no-console */

export default {
  name: 'loadBudgetModal',
  data: function () {
    return {
      selectedBudget: null,
      budgetList: [],
      foreignBudget: '',
      exampleBudgets: [],
      selectedExampleBudget: null,
      loading: true
    }
  },
  async mounted() {
    this.$refs.budgetList.focus()
    await this.$store.dispatch('loadBudgetList').then(
      () => console.log('loaded budgetlists successfully'),
      (err) => {
        if (err=='nothing saved') {
          console.log('Standard budget list is still empty');
        }
      }
    )
    await this.$store.dispatch('loadBudgetListFrom', this.$store.getters.exampleFolder).then(
      folder => {
        this.exampleBudgets=folder
      }, err => {
        console.log(`something went wrong while listing example folder: ${err}`)
      }
    )
    this.loading = false
  },
  methods: {
    async loadBudget () {
      let budgetURL = this.foreignBudget ||
        (this.selectedExampleBudget ? this.selectedExampleBudget.uri.value : false ) ||
        (this.selectedBudget  ? this.selectedBudget.uri.value : false )
      this.loading = true
      console.log('loading'  + JSON.stringify(budgetURL))
      await this.$store.dispatch('loadBudget', budgetURL).then(
        async success => {
          await this.$store.dispatch('loadExpenseCategories', budgetURL)
          this.loading=false
          this.$toast.open({
            message: this.$t('load-success') + '<br>' + decodeURI(success),
            type: 'is-success',
            duration: 3000
          })
          this.$emit('repaintChart')
          this.$parent.close()
        }, error => {
          this.loading=false
          this.$toast.open({
            message: this.$t('load-error') + error,
            type: 'is-danger',
            duration: 3000
          })
          this.$emit('repaintChart')
          this.$parent.close()
        }
      )
    },

  }
}
</script>
