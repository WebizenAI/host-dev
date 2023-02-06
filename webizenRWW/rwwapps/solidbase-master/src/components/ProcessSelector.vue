<template>
<b-field :label="$t('set-activity')">
  <b-select v-model="selectedProcess" @input="$emit('input',$event)">
    <option v-for="process in procs" :value="process.ID" :key="process.ID.value">

      {{ process.name}}
    </option>
  </b-select>
</b-field>
</template>

<script>
/* eslint-disable no-console*/
export default {
  name: 'ProcessSelector',
  props: ['currentProc', 'exclude'],
  data() {
    return {
      selectedProcess: this.currentProc,
    }
  },
  computed: {
    procs: function() {
      var i, index
      var allProcs = this.$store.getters.allProcesses(undefined)
      var procIds = allProcs.map(a => a.ID)
      var exc = this.exclude ? this.exclude : []

      for (i = 0; i < exc.length; i++) {
        // console.log('Exclude: ')
        // console.log(JSON.stringify(exc[i]))
        // console.log(JSON.stringify(procIds));
        // console.log(JSON.stringify(allProcs))

        index = procIds.indexOf(exc[i])
        if (index > -1) {
          allProcs.splice(index, 1)
          procIds = allProcs.map(a => a.ID)
        }
      }
      return allProcs
    }
  },
  watch: {
    currentProc: function() {
      this.selectedProcess = this.currentProc
    }
  }
}
</script>
