<template>
<div class="modal-card" style="width: auto" @keyup.enter.capture="addCat()">
  <header class="modal-card-head">
    <p class="modal-card-title">{{$t('add-exp-cat')}}</p>
  </header>
  <section class="modal-card-body">
    <b-field :label="$t('name')">
      <b-input v-model="catName" :placeholder="$t('enter-exp-cat-name')" ref="nameField">
      </b-input>
    </b-field>
    <b-field :label="$t('sel-loc')">
      <b-select v-model="selectedLocale">
        <option v-for="loc in $store.state.locales" :value="loc" :key="loc">
          {{ loc }}
        </option>
      </b-select>
    </b-field>
  </section>
  <footer class="modal-card-foot" style="justify-content:space-between">
    <button class="button is-success is-rounded" @click="addCat()">
      <span class="icon is-small">
        <i class="fas fa-check"></i>
      </span>
      <span>{{$t('add')}}</span>
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
/* eslint-disable no-console*/

export default {
  name: 'addCategoryModal',
  props: ['admin'],
  data: function() {
    return {
      catName: null,
      selectedLocale: 'en'
    }
  },
  mounted() {
    this.$refs.nameField.focus()
  },
  methods: {
    addCat() {
      if (this.$store.getters.classList({
          admin: this.admin
        }).includes(this.catName)) {
        this.$toast.open({
          message: this.$t('add-cat-dup-error'),
          type: 'is-danger',
          duration: 3000
        })
        return false
      }
      let graph = this.admin ? this.$store.state.eClassGraphAdmin : this.$store.state.eClassGraph
      let ressource = graph.sym(this.$store.getters.adminIri(this.admin) + '#' + encodeURI(this
        .catName))

      this.$store.dispatch('changeExpenseClass', {
        admin: this.admin,
        ressource: ressource,
        content: '',
        loc: this.selectedLocale,
        label: this.catName
      })

      this.$emit('input', {
        name: this.catName,
        ressource: ressource,
        lang: this.selectedLocale
      })
      this.$parent.close()
    }
  }
}
</script>
