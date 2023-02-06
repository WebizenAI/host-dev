<template>
<div class="modal-card" style="width: auto" @keyup.enter.capture="saveProcess()">
  <header class="modal-card-head">
    <p class="modal-card-title">{{$t('add-activity')}}</p>
  </header>
  <section class="modal-card-body">
    <b-field label="Name">
      <b-input v-model="lowerProcessName" :placeholder="$t('enter-act-name')" ref="nameField">
      </b-input>
    </b-field>
    <ProcessSelector :currentProc="this.focus.ID" @input="newParentProcess($event)" />
    <p><b>{{$t('edit-note')}}</b></p>
    <div id="editor">
      <textarea :value="input" @input="update"></textarea>
      <div v-html="compiledMarkdown"></div>
    </div>
  </section>
  <footer class="modal-card-foot" style="justify-content:space-between">
    <button class="button is-success is-rounded" @click="saveProcess()">
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
import myMarked from 'marked'
import ProcessSelector from '@/components/ProcessSelector.vue'

export default {
  name: 'addProcessModal',
  props: ['focus'],
  data: function() {
    return {
      lowerProcessName: null,
      higherProcessId: null,
      input: null
    }
  },
  components: {
    ProcessSelector
  },
  mounted() {
    this.$refs.nameField.focus()
  },
  computed: {
    compiledMarkdown() {
      return this.input ? myMarked(this.input, {
        sanitize: true
      }) : ''
    }
  },
  methods: {
    newParentProcess(proc) {
      this.higherProcessId = proc
    },
    saveProcess() {
      var ID = {}
      var processNames = this.$store.getters.allProcesses().map(a => a.name)

      console.log('saveProcess')
      console.log(this.lowerProcessName);
      console.log(processNames);

      if (processNames.includes(this.lowerProcessName)) {
        console.log('Process Name already chosen');
        this.$toast.open({
          message: this.$t('no-double-cat'),
          type: 'is-danger',
          duration: 3000
        })
        return false
      }
      if (this.higherProcessId == null) this.higherProcessId = this.focus.ID

      this.$store.dispatch('addProcess', {
        name: this.lowerProcessName,
        ID: ID
      })
      this.$store.dispatch('addRelation', {
        higher: this.higherProcessId,
        lower: ID.value
      })

      if (this.input != null) {
        this.$store.dispatch('changeNote', {
          ID: ID.value,
          newNote: this.input
        })
      }

      this.$emit('repaintChart', this.higherProcessId)
      this.$parent.close()
    },
    update(e) {
      this.input = e.target.value
    }
  }
}
</script>
