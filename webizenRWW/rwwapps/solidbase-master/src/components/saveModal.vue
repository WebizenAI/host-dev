<template>
    <div class="modal-card" style="width: auto"  @keyup.enter.capture="save">
        <header class="modal-card-head">
            <p class="modal-card-title">{{$t('save-budget')}}</p>
        </header>
        <section class="modal-card-body">
          <!-- TODO: format this string better -->
          <div>{{$t('no-special-chars')}}<br><code> {{ this.format.toString() }} </code></div><br>

            <b-field label="Name">
                    <b-input v-model="ressourceName"
                             :placeholder="$t('edit-res-name')"
                             ref="nameField">
                    </b-input>
            </b-field>
        </section>
        <footer class="modal-card-foot" style="justify-content:space-between">
              <button class="button is-success is-rounded" @click="save()">
                <span class="icon is-small">
                  <i class="fas fa-check"></i>
                </span>
                <span>{{$t('save')}}</span>
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
  name: 'saveModal',
  data: function () {
    return {
      ressourceName: decodeURIComponent(this.$store.getters.ldRessourceName),
      // eslint-disable-next-line no-useless-escape
      format: /[!@#$%^&*()+\=\[\]{};':"\\|,<>\/?]/
    }
  },
  computed: {
    selectedBudgetUrl() {
      let webId = new URL(this.$store.state.webId)
      let subfolder = this.$store.getters.privateStatus ? process.env.VUE_APP_PRIVATE_SUBFOLDER : process.env.VUE_APP_PUBLIC_SUBFOLDER
      let loc=new URL(subfolder + this.ressourceName, webId.origin)
      console.log(loc);
      return loc.href
    }
  },
  mounted() {
    this.$refs.nameField.focus()
  },
  methods: {
    save() {
      if ( this.format.test(this.ressourceName)) {
        this.$toast.open({
          message: this.$t('no-special-chars-msg'),
          type: 'is-danger',
          duration: 3000
        })
        console.log('test failed');
        return false
      }
      this.$store.dispatch('changeLdRessource',
          {newUrl:this.selectedBudgetUrl, oldUrl:this.$store.getters.ldRessource}).then(() => {
        this.$store.dispatch('changeOwner',
            {newOwner: this.$store.state.webId, oldOwner: this.$store.getters.preparedFor().value } ).then(()=> {
          this.$store.dispatch('saveRessource', this.selectedBudgetUrl).then(
            () => {
              this.$toast.open({
                message: this.$t('save-budget-success') + '<br>' + this.selectedBudgetUrl,
                type: 'is-success',
                duration: 3000
              })
              this.$emit('repaintChart')
              this.$parent.close()
            }, error => {
              this.$toast.open({
                message: this.$t('save-budget-error') + '<br>Error code: ' + error,
                type: 'is-danger',
                duration: 3000
              })
              this.$emit('repaintChart')
              this.$parent.close()
            }
          )
        })
      })
    }
  }
}
</script>
