<template>
  <div id="app">
    <m-head></m-head>
    <tab></tab>
    <!-- 使用<keep-alive>标签缓存显示内容 -->
    <keep-alive>
        <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script type="text/ecmascript-6">
import MHead from './components/m-head/m-head'
import Tab from './components/tab/tab'
import Player from './components/player/player'

export default {
  name: 'App',
  components:{
    MHead,Tab,Player
  }
}
</script>

<style scoped lang='less'>

</style>