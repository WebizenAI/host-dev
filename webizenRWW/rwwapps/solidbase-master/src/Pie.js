import { Pie, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Pie,
  mixins: [ reactiveProp ],
  props: [ 'chartData', 'options' ],
  mounted () {
    // console.log('Pie:');
    // console.log(this.data);
    this.renderChart( this.chartData, this.options )
  }
}
