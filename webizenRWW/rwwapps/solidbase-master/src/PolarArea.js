import { PolarArea, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: PolarArea,
  mixins: [ reactiveProp ],
  props: [ 'data', 'options' ],
  mounted () {
    this.renderChart( this.data, this.options )
  }
}