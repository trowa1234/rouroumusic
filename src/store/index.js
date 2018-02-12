//vuex入口文件

import Vue from 'vue'   
import Vuex from 'vuex'//引入vuex
import * as actions from './actions'
import * as getters from './getters'    //使用了* as，可以通过getters.singer的方式获取singer的数据
import state from './state' //引入状态
import mutations from './mutations'//引入方法

//vuex提供的插件，通过mutation修改state时，会在控制台打印出这条修改记录
import createLogger from 'vuex/dist/logger'


//注册vuex插件
Vue.use(Vuex)


//控制vuex调试工具的开关
//在webpack开发模式时process.env.NODE_ENV是'dev'，在生产模式时是'production'
const debug = process.env.NODE_ENV !== 'production'


//曝露Vuex.Store实例对象出去，并把引入的actions， getters等作为参数传递进去
export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations,
    strict:debug,    //严格模式，开发时开启
    //plugins就是插件，它是1个数组，里面可以是多个插件
    plugins:debug ? [createLogger()] : []   //打印修改记录，开发时开启
})