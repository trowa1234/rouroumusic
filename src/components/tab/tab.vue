<template>
    <div class="tab">
        <router-link tag="a" to="/recommend" class="tab-item">
            <span class="tab-link">推荐</span>
        </router-link>
        <router-link tag="a" to="/singer" class="tab-item">
            <span class="tab-link">歌手</span>
        </router-link>
        <router-link tag="a" to="/rank" class="tab-item">
            <span class="tab-link">排行</span>
        </router-link>
        <router-link tag="a" to="/search" class="tab-item">
            <span class="tab-link">搜索</span>
        </router-link>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
    name: "tab"
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
  a:hover{text-decoration: none;}
  .tab{
    .clearfix();
    .tab-item{
      width: 25%;text-align: center;font-size: @font-size-medium;font-weight: bold;float: left;height: 44px;line-height: 44px;
      .tab-link{color:@text-color-grayer;padding:0 5px 5px 5px;}
      &.router-link-active{
        .tab-link{color:@text-color-yellow;border-bottom: 2px solid @text-color-yellow}
      }
    }
  }
</style>