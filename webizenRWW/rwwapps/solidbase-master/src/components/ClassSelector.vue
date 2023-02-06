<template>
<section v-if="classes">
  <b-select v-model="selectedClass" @input="$emit('input',$event)"  ref="dropdown">
    <option v-for="businessClass in classes" :value="businessClass" :key="businessClass.value">

      {{ localize ? $store.getters.classLabel({ressource: businessClass}) : decodeURIComponent(businessClass.value.split('#').pop())}}
    </option>
    {{ currentClass}}
  </b-select>
</section>
</template>

<script>
/* eslint-disable no-console*/
export default {
  name: 'ClassSelector',
  props: ['classes', 'currentClass', 'localize'],
  data() {
    return {
      selectedClass: this.currentClass || this.classes[0]
    }
  },
  mounted() {
    this.$refs.dropdown.focus()
  },
  watch: {
    currentClass: function() {
      this.selectedClass = this.currentClass || this.classes[0]
    }
  }
}
</script>
