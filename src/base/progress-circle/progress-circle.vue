<template>
    <div class="progress-circle">
        <!-- 环形进度的宽高可以自己定义，有父组件传入 -->
        <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent" />
            <!-- 传入的数据和根据进度比计算svg圆形进度条的比例。 dashArray总进度，dashOffset当前进度，当前进度为0时，占满整个进度条-->
            <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffset" />
        </svg>
        <slot></slot>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
  name: "progress-circle",
  props:{
      //环形进度的大小
      radius:{
          type:Number,
          default:50
      },
      //进度百分比
      percent:{
          type:Number,
          default:0
      }
  },
  data() {
    return {
      dashArray: Math.PI * 100  //环形总进度计算
    }
  },
  computed:{
      //计算当前进度，因为是为0时铺满进度条，所以用1-百分比
      dashOffset(){
          return (1-this.percent) * this.dashArray;
      }
  }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.progress-circle{
    position: relative;
    circle{
        stroke-width: 8px;
        transform-origin: center;
        &.progress-background{
            transform:scale(0.9);
            stroke:@theme-yellow;
        }
        &.progress-bar{
            transform:scale(0.9) rotate(-90deg);
            stroke:@brand-danger;
        }
    }
}
</style>