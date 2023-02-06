<template>
<div class="modal-card" style="width: auto">
  <header class="modal-card-head">
    <p class="modal-card-title">{{$t('join-exp')}}</p>
  </header>
  <section class="modal-card-body">
    <b-field :label="$t('joint-exp-name')">
      <b-autocomplete v-model="intentName" :data="filteredIntents"
        :placeholder="$t('enter-joint-exp-name')" />
    </b-field>
    {{$t('join-following')}}
    <ul v-for="name in names" :key="name">
      <li>{{name}}</li>
    </ul>
  </section>
  <footer class="modal-card-foot" style="justify-content:space-between">
    <button class="button is-success is-rounded" @click="join()">
      <span class="icon is-small">
        <i class="fas fa-check"></i>
      </span>
      <span>OK</span>
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

export default {
  name: 'joinIntentsModal',
  props: ['intents'],
  data: function() {
    return {
      intentName: '',
    }
  },
  computed: {
    filteredIntents() {
      if (!this.intents) return []
      return this.names.filter((option) => {
        return option
          .toString()
          .toLowerCase()
          .indexOf(this.intentName.toLowerCase()) >= 0
      })
    },
    names() {
      return this.intents.map(intent => intent.label)
    }
  },
  methods: {
    async join() {
      this.intents.map(async intent => {
        if (intent.label != this.intentName)
          await this.$store.dispatch('changeLabel', {
            ID: intent.ID,
            newName: this.intentName
          })
      })
      this.$emit('repaintChart')
      this.$parent.close()
    }
  }
}
</script>
