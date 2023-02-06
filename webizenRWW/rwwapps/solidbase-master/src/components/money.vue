<template>
  <i18n-n :value="amount" format="currency" tag="span" :locale="locale" style="text-align:end;">
    <template v-slot:integer="slotProps">{{ slotProps.integer }}</template>
    <template v-if="!decimals" v-slot:decimal="slotProps"></template>
    <template v-if="!decimals" v-slot:fraction="slotProps"></template>
    <template v-if="!decimals" v-slot:currency="slotProps"></template>
  </i18n-n>
</template>


<script>
// Displays a amount of money, optionally without fraction and currency

export default {
  name: 'money',
  props: ['amount', 'locale'],
  computed: {
    decimals (){
      return this.$store.state.decimals
    }
  }
}
</script>
