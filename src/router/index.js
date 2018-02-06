import Vue from 'vue'
import Router from 'vue-router'
import Recommend from '@/components/recommend/recommend'
import Singer from '@/components/singer/singer'
import Rank from '@/components/rank/rank'
import Search from '@/components/search/search'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',  //根路径
      redirect:'/recommend' //路由重定向到推荐页面
    },
    {
      path: '/recommend', //推荐页
      name: 'Recommend',
      component: Recommend
    },
    {
      path: '/singer',  //歌手页
      name: 'Singer',
      component: Singer
    },
    {
      path: '/rank',  //排行页
      name: 'Rank',
      component: Rank
    },
    {
      path: '/search',  //搜索页
      name: 'Search',
      component: Search
    }
  ]
})
