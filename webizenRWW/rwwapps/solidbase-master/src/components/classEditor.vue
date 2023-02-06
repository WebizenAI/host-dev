<template>
<div style="text-align:left;max-width:800px;">
  <div v-if="$store.getters.classList({admin}).length">
    <h4>{{$t('edit-text')}}</h4>
    <b-field grouped>
      <b-field :message="$t('sel-cat')">
        <ClassSelector :classes="$store.getters.expenseClasses({admin})"
          :currentClass="expenseClass"
          @input="loadText({name: $event})" />
      </b-field>
      <b-field :message="$t('sel-loc')">
        <b-select v-model="selectedLocale" @input="loadText({name: expenseClass, lang: $event})">
          <option v-for="loc in $store.state.locales" :value="loc" :key="loc">
            {{ loc }}
          </option>
        </b-select>
      </b-field>
      <b-field :message="$t('exp-cat-label')">
        <b-input v-model="prefLabel" placeholder='Enter label' @input="change=true"/>
      </b-field>
    </b-field>
    <EasyMde v-model="content" ref="markdownEditor" @input="change=true"></EasyMde>
    <div class="buttons">
      <button class="button is-primary" @click="changeClass()">
        <span class="icon is-small"><i class="fas fa-check"></i></span>
        <span>{{$t('save')}}</span>
      </button>
      <button class="button is-danger" @click="deleteClass({eClass:expenseClass, super:admin})">
        <span class="icon is-small">
          <i class="fas fa-times"></i>
        </span>
        <span>{{$t('delete')}}</span>
      </button>
      <button class="button is-primary"
        @click="isAddModalActive = true">{{$t('add-exp-cat')}}
      </button>
      <button v-if="!admin && $store.state.admin" title="Copies all budget descriptions from the admin pod" class="button is-danger" @click="refreshClasses()">
        <span class="icon is-small">
          <i class="fas fa-times"></i>
        </span>
        <span>Refresh categories</span>
      </button>
    </div>
  </div>
  <button v-else class="button is-primary"
    @click="isAddModalActive = true">{{$t('add-exp-cat')}}
  </button>

  <b-modal :active.sync="isAddModalActive" has-modal-card>
    <addCategoryModal :admin='admin'
      @input='expenseClass=$event.ressource;selectedLocale=$event.lang;prefLabel=$event.name;content=""' />
  </b-modal>
</div>
</template>

<script>
/* eslint-disable no-console */

import ClassSelector from '@/components/ClassSelector.vue'
import addCategoryModal from '@/components/addCategoryModal'
import EasyMde from '@/components/easy-mde.vue'

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
  name: 'classEditor',
  props: ['admin'],
  components: {
    ClassSelector,
    EasyMde,
    addCategoryModal
  },
  data() {
    return {
      expenseClass: null,
      content: "",
      selectedLocale: this.$store.state.locale,
      oldloc: this.$store.state.locale,
      oldClass: null,
      prefLabel: null,
      isAddModalActive: false,
      change: false
    }
  },
  mounted() {
    this.expenseClass = this.$store.getters.expenseClasses({
      admin: this.admin
    })[0]
    this.loadText({
      name: this.expenseClass
    })
    this.oldClass = this.expenseClass
  },
  methods: {
    async changeClass(eClass,lang) {
      if (this.expenseClass == '') {
        console.log('select class first')
        return false
      }

      let cat = eClass || this.expenseClass
      let loc = lang || this.selectedLocale
      let label = this.prefLabel || this.$store.getters.classLabel({ressource: cat, admin: this.admin})

      await this.$store.dispatch('changeExpenseClass', {
          admin: this.admin,
          ressource: cat,
          content: this.content,
          loc, label
        }).then(() => {
          this.$toast.open({
            message: this.$t('save-text-success'),
            type: 'is-success',
            duration: 3000
          })
          if (label != this.prefLabel) this.prefLabel = this.$store.getters.classLabel({ressource: this.expenseClass, admin: this.admin})
        }, err => {
          this.$toast.open({
            message: this.$t('save-text-error') + '<br>Error message: ' + err,
            type: 'is-danger',
            duration: 3000
          })
        }
      )
    },
    deleteClass() {
      this.$dialog.confirm({
        message: this.$t('confirm-delete-class') + ' <i>' +
          decodeURIComponent(this.expenseClass.value.split('#').pop()) + '</i> ?',
        onConfirm: async () => {
          let expenseClasses = this.$store.getters.expenseClasses({
            admin: this.admin
          })
          if (expenseClasses.length>1) {
            this.$store.dispatch('destroyExpenseClass', {
              ressource: this.expenseClass,
              admin: this.admin
            }).then(
              () => {
                this.$toast.open({
                  message: this.$t('delete-class-success') + '<br>'+
                   decodeURIComponent(this.expenseClass.value.split('#').pop()),
                  type: 'is-success',
                  duration: 3000
                })
                this.expenseClass = this.$store.getters.expenseClasses({
                  admin: this.admin
                })[0]
                console.log(`new current expense class: ${this.expenseClass}`);
                this.loadText({name: this.expenseClass})
              }, error => {
                this.$toast.open({
                  message: this.$t('delete-class-error') + '.<br>Error message: ' + error,
                  type: 'is-danger',
                  duration: 3000
                })
              }
            )
          } else {
            await this.$store.dispatch('copyAdminRessource')
          }
        }
      })
    },
    refreshClasses() {
      this.$dialog.confirm({
        message:'Do you really want to copy the category descriptions from the admin POD? This will delete all category text modifications you made.',
        onConfirm: async () => {
          await this.$store.dispatch('copyAdminRessource')
          this.expenseClass = this.$store.getters.expenseClasses({
            admin: false
          })[0]
          this.loadText({
            name: this.expenseClass
          })
        },
        confirmText: 'Refresh category descriptions',
        type: 'is-danger',
        hasIcon: true,
      })
    },
    async loadText({name, lang}) {
      this.loading=true
      if (this.change) {
        await this.changeClass(this.oldClass, this.oldloc)
      }
      if (name) {
        this.expenseClass = name
        this.oldClass = name
      }
      if (lang) this.oldloc=lang
      else lang = this.selectedLocale

      console.log(`loading text for ${name}`);
      if ( name == null ) return false

      let text = this.$store.getters.eClassText({
        ressource: this.expenseClass,
        admin: this.admin,
        lang: lang
      })

      if (text) {
        this.content = text.content
        this.prefLabel = text.prefLabel
      }

      console.log(`${this.expenseClass}@${lang} contains:\n${JSON.stringify(text)}`);

      sleep(500).then(()=> { //TODO: Beautify
        this.change=false
      })
    }
  }
}
</script>
