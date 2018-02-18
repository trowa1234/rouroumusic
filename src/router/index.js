import Vue from 'vue'
import Router from 'vue-router'
import Recommend from '@/components/recommend/recommend'
import Singer from '@/components/singer/singer'
import Rank from '@/components/rank/rank'
import Search from '@/components/search/search'
import SingerDetail from '@/components/singer-detail/singer-detail'
import Disc from '@/components/disc/disc'

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/', //根路径
        redirect: '/recommend' //路由重定向到推荐页面
    },
    {
        path: '/recommend', //推荐页
        name: 'Recommend', //页面名字，可以不用写。功能：报错时可以显示出来
        component: Recommend, //访问的页面。在顶部import引入注册的组件
        children: [
            {
                path: ':id',
                name: 'Disc',
                component: Disc
            }
        ]
    },
    {
        path: '/singer', //歌手页
        name: 'Singer',
        component: Singer,
        children: [ //歌手页子路由
            {
                path: ':id',
                name: 'SingerDetail',
                component: SingerDetail
            }
        ]
    },
    {
        path: '/rank', //排行页
        name: 'Rank',
        component: Rank
    },
    {
        path: '/search', //搜索页
        name: 'Search',
        component: Search
    }
    ]
})
