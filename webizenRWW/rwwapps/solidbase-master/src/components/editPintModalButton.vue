<template>
<section>
  <button class="button" @click="isEditModalActive = true">
    {{$t('edit')}}
    {{type == 'process' ? $t('activity') : type=='expense' ? $tc('expense',1) : $tc('income',1)}}
  </button>
  <b-modal :active.sync="isEditModalActive" has-modal-card>
    <editPintModal :type="type" :label="item.name" :ID="item.ID"
      @valueChanged="$emit('valueChanged',$event)" />
  </b-modal>
</section>
</template>

<script>
import editPintModal from '@/components/editPintModal.vue'

export default {
  name: 'editPintModalButton',
  props: ['type', 'item'],
  components: {
    editPintModal
  },
  data: function() {
    return {
      isEditModalActive: false
    }
  }
  // created: function() {
  //   document.addEventListener('keyup', this.KeyListener);
  // },
  // destroyed: function() {
  //   document.removeEventListener('keyup', this.KeyListener);
  // },
  // methods: {
  //   KeyListener: function(evt) {
  //     if (evt.keyCode === 80 && evt.ctrlKey && evt.altKey) { // 80==`p`
  //       this.isEditModalActive = true
  //     }
  //   }
  // }
}
</script>
