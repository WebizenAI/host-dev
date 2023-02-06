<template>
<nav class="navbar is-fixed-bottom" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">

    <a role="button" @click="makeBurger" class="navbar-burger" data-target="navMenu"
      aria-label="menu" aria-expanded="false" v-bind:class="{ 'is-active': activator }">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>
  <div class="navbar-menu" id="navMenu" v-bind:class="{ 'is-active': activator }">
    <div class="navbar-start">
      <div class="navbar-item">
        <div class="buttons" style="align-items: center;justify-content: center;">
          <button class="button is-primary" @click="isProcessModalActive = true">
            {{$t('add-activity')}}
          </button>
          <button class="button is-primary" @click="isExpenseModalActive = true"
            title="ctrl+shift+x">
            {{$t('add-expense')}}
          </button>
          <button class="button is-primary" @click="isIncomeModalActive = true">
            {{$t('add-income')}}
          </button>
          <editPintModalButton type="process" :item="focus"
            @valueChanged="$emit('repaintChart',$event)"
            @toggleAnnualView="$emit('toggleAnnualView', $event)" />
        </div>
      </div>
    </div>
    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons" style="align-items: center;justify-content: center;">
          <button class="button is-primary" @click="isSaveModalActive = true" title="ctrl+shift+v">
            <span class="icon is-small"><i class="fas fa-check"></i></span>
            <span>{{$t('save')}}</span>
          </button>
          <button class="button is-warning" @click="resetBudget()" :title="$t('new-budget-title')">
            <span>{{$t('new-budget')}}</span>
          </button>
          <button  class="button is-danger" @click="deleteBudget()" :title="$t('delete-title')">
            <span class="icon is-small">
              <i class="fas fa-times"></i>
            </span>
            <span>{{$t('delete')}}</span>
          </button>
          <button class="button is-warning" @click="isLoadModalActive = true" title="ctrl+shift+l">
            {{$t('load')}}
          </button>
          <button class="button" @click="isEditModalActive = true" :title="$t('edit-meta-data')">
            {{$t('edit-budget')}}
          </button>
        </div>
      </div>
    </div>
    <b-modal :active.sync="isProcessModalActive" has-modal-card>
      <addProcessModal :focus="this.focus" @repaintChart="$emit('repaintChart',$event)" />
    </b-modal>
    <b-modal :active.sync="isExpenseModalActive" has-modal-card>
      <addExpenseModal :focus="focus" :cat="cat" @repaintChart="$emit('repaintChart',$event)" />
    </b-modal>
    <b-modal :active.sync="isIncomeModalActive" has-modal-card>
      <addIncomeModal :focus="this.focus" @repaintChart="$emit('repaintChart',$event)" />
    </b-modal>
    <b-modal :active.sync="isSaveModalActive" has-modal-card>
      <saveModal @repaintChart="$emit('repaintChart')" />
    </b-modal>
    <b-modal :active.sync="isLoadModalActive" has-modal-card>
      <loadBudgetModal @repaintChart="$emit('repaintChart',$event)" />
    </b-modal>
    <b-modal :can-cancel="allowCancel" :active.sync="isEditModalActive" has-modal-card>
      <editBudgetModal :showCancel="allowCancel" @repaintChart="$emit('repaintChart',allowCancel ? ($event || focus.ID) : undefined)" />
    </b-modal>
  </div>
</nav>
</template>

<script>
/* eslint-disable no-console*/

import addExpenseModal from '@/components/addExpenseModal'
import addIncomeModal from '@/components/addIncomeModal'
import addProcessModal from '@/components/addProcessModal'
import saveModal from '@/components/saveModal'
import loadBudgetModal from '@/components/loadBudgetModal'
import editPintModalButton from '@/components/editPintModalButton.vue'
import editBudgetModal from '@/components/editBudgetModal.vue'


async function reset () {
  console.log('Reset Budget');
  await this.$store.dispatch('initGraph').then(async () => {
    this.allowCancel = false
    this.isEditModalActive=true
  })
}

export default {
  name: 'ControlField',
  props: ['focus', 'cat'],
  components: {
    addExpenseModal,
    addIncomeModal,
    addProcessModal,
    saveModal,
    loadBudgetModal,
    editPintModalButton,
    editBudgetModal
  },
  data: function() {
    return {
      isProcessModalActive: false,
      isExpenseModalActive: false,
      isIncomeModalActive: false,
      isSaveModalActive: false,
      isLoadModalActive: false,
      isEditModalActive: false,
      processName: '',
      returnProcess: null,
      intentName: '',
      intentValue: 0,
      activator: false,
      allowCancel: true
    }
  },
  computed: {
    budget () {
      return this.focus.ID.value.split('#')[0]
    }
  },
  created: function() {
    document.addEventListener('keyup', this.KeyListener);
  },
  destroyed: function() {
    document.removeEventListener('keyup', this.KeyListener);
  },
  methods: {
    deleteBudget() {
      this.$dialog.confirm({
        message: this.$t('confirm-delete') + ' <i>'+ this.budget + '</i> ?',
        onConfirm: () => {
          this.$store.dispatch('deleteRessource', this.budget).then(
            () => {
              this.$toast.open({
                message: this.$t('delete-success') + '<br>' + this.budget,
                type: 'is-success',
                duration: 3000
              })
              this.$store.dispatch('loadBudgetList').then(
                async () => {
                  await this.$store.dispatch('loadBudget')
                  this.$emit('repaintChart')
                },
                async () => {
                  this.$dialog.alert(this.$t('init-after-delete'))
                  await reset.call(this)
                })
            }, error => {
              this.$toast.open({
                message: this.$t('delete-error') + '<br>Error message: ' + error,
                type: 'is-danger',
                duration: 3000
              })
            }
          )
        }
      })
    },
    makeBurger() {
      this.activator = !this.activator
      return this.activator
    },
    KeyListener(evt) {
      if (evt.ctrlKey && evt.shiftKey) {
        switch (evt.keyCode) {
          case 76:
            { // 76==`L`
              this.isLoadModalActive = true
              break
            }
          case 86:
            { // == v
              this.isSaveModalActive = true
              break
            }
          case 171:
            { //== +
              this.isProcessModalActive = true
              break
            }
          case 88:
            { //== x
              this.isExpenseModalActive = true
              break
            }
          default:
        }
      }
    },
    resetBudget() { // create sample datastructure
      this.$dialog.confirm({
        message: this.$t('confirm-reset'),
        onConfirm: async () => {
          await this.$dialog.confirm({
            message: this.$t('confirm-change'),
            onConfirm: () => {
              this.$store.dispatch('saveRessource', this.budget).then(
                async () => {
                  this.$toast.open({
                    message: this.$t('save-budget-success') + '<br>' + this.budget,
                    type: 'is-success',
                    duration: 3000
                  })
                  await reset.call(this)
                }, error => {
                  this.$toast.open({
                    message: this.$t('save-budget-error') + '<br>Error code: ' + error,
                    type: 'is-danger',
                    duration: 3000
                  })
                }
              )
            },
            onCancel: async () => await reset.call(this)
          })

        }
      })
    }
  }
}
</script>
