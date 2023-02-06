// adapted from: https://forum.vuejs.org/t/vue-2-and-simplemde/2707
<template>
  <textarea ref="area"></textarea>
</template>

<script>
import easymde from 'easymde' // import from npm package

export default {
  props: ['value', 'textId'],
  mounted() {
    this.mde = new easymde({
      element: this.$refs.area,
      // autosave: { //TODO: check why not working.
      //   enabled: true,
      //   uniqueId: this.textId
      // },
      spellChecker: false
      //TODO: Maybe add custom spellchecker:
      // https://github.com/sparksuite/codemirror-spell-checker/issues/16
      // https://github.com/inkdropapp/codemirror-spell-checker/pull/2
    })
    this.mde.value(this.value)
    var self=this
    this.mde.codemirror.on('change', function() {
			self.$emit('input', self.mde.value())
		})
  },
  watch: {
		value(newVal) { if (newVal != this.mde.value()) { this.mde.value(newVal) } }
	},
  beforeDestroy() {
    this.mde.toTextArea() // clean up when component gets destroyed.
  }
}
</script>
