import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      alias: '/home',
      name: 'home',
      meta: { title: 'solidbase'},  // based on: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      meta: { title: 'about solidbase'},
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
   {
      path: '/chart',
      name: 'chart',
      meta: { title: 'solidbase budget planner'},
      //component: Chart //static loaa
      component: () => import(/* webpackChunkName: "chart" */ './views/Chart.vue'), props: true //dynamic load
    },
   {
      path: '/config',
      name: 'config',
      meta: { title: 'solidbase configuration'},
      component: () => import(/* webpackChunkName: "config" */ './views/Config.vue')
    },
    {
      path: '/load',
      name: 'load',
      meta: { title: 'load budget'},
      component: () => import('./components/loadBudget.vue'), props: (route) => ({ url: route.query.url})
    }
  ]
})
