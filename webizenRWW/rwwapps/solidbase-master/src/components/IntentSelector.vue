<template>
    <b-select  v-model="selectedIntent" @input="$emit('input',$event)">
        <option
            v-for="intent in siblings()"
            :value="intent"
            :key="intent.ID.value">

            {{ intent.name}}
        </option>
    </b-select>
</template>

<script>
/* eslint-disable no-console*/
export default {
  name: 'IntentSelector',
  props: ['currentIntent', 'currentProc'],
  data () {
    return {
      selectedIntent: null,
      proc: null
    }
  },
  methods: {
    siblings: function () {
      var index
      if (this.currentProc) {
        console.log('intentselector:');
        console.log(this.currentProc);
        return this.$store.getters.intentsList(this.currentProc)
      } else {
        this.proc = this.$store.getters.processOfIntent(this.currentIntent)
        var intents = this.$store.getters.intentsList(this.proc)
        var intentIds = intents.map(a => a.ID)
        index = intentIds.indexOf(this.currentIntent)
        intents.splice(index,1)
        return intents
      }
    }
  }
}
</script>
