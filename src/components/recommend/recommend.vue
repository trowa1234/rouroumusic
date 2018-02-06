<template>
  <div class="recommend">
    <div class="recommend-content">
      <!-- v-if，注意这里一定要得到数据后再开始后面的循环渲染，否则slider组件中无法计算宽度 -->
      <div v-if="recommendSlider.length" class="slider-wrapper">
        <slider>
           <!-- 这里就是填充slider组件中slot标签的内容。这里可以不绑定key -->
          <div v-for="(item,index) in recommendSlider" v-bind:key="index">
            <a :href="item.linkUrl">
              <img :src="item.picUrl" />
            </a>
          </div>
        </slider>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
//export曝露的所以需要{}
import { getRecommend } from "@/api/recommend"; //引入获取轮播数据的方法
import { ERR_OK } from "@/api/config"; //引入返回成功code

import Slider from "@/base/slider/slider"; //引入轮播组件

export default {
  name: "recommend",
  data() {
    //data中的值必须由return返回
    return {
      recommendSlider: [] //接收轮播图数据的空数组
    };
  },
  created() {
    //在生命周期created（页面被创建时）这个钩子函数中调用
    this._getRecommend(); //获取轮播数据。在methods中进行了包装，也可直接在此调用getRecommend
  },
  methods: {
    _getRecommend() {
      //getRecommend()返回的其实是Promise对象，所以这里用了.then接收数据
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          //console.log(res); //返回的是所有的数据
          console.log(res.data.slider); //轮播数据是一个数组
          this.recommendSlider = res.data.slider; //赋值给空数组
        }
      });
    }
  },
  components:{
    Slider
  }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.recommend{
  position: fixed;top: 88px;width: 100%;height: 100%;
}
</style>