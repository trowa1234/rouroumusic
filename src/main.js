import 'babel-polyfill' //对ES6的一些api进行转义
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store' //引入vuex入口文件
import fastclick from 'fastclick' //解决移动端点击有300毫秒的延迟
import VueLazyLoad from 'vue-lazyload' //懒加载

//index页面重置CSS样式
require('!style-loader!css-loader!less-loader!./common/less/index.less');

fastclick.attach(document.body) //解决移动端点击有300毫秒的延迟

Vue.use(VueLazyLoad, {
  loading: require('@/common/images/loading.png'),  //图片加载时显示的图片
  error: require('@/common/images/error.png')   //图片加载失败时显示的图片
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,   //路由
  store,    //vuex
  components: {
    App
  },
  template: '<App/>'

  //render: h => h(App)
})
