<template>
  <div id="app">
    <m-head></m-head>
    <tab></tab>
    <router-view/>
  </div>
</template>

<script type="text/ecmascript-6">
import MHead from './components/m-head/m-head'
import Tab from './components/tab/tab'
export default {
  name: 'App',
  components:{
    MHead,Tab
  }
}
</script>

<style scoped lang='less'>

</style>