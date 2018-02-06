<template>
<!-- ref就是绑定dom元素。绑定了最外层的dom和装轮播图的dom -->
  <div class="slider" ref="slider">
   <div class="slider-group" ref="sliderGroup">
       <!-- 使用插槽装内容 -->
       <slot>
       </slot>
   </div>
  </div>
</template>

<script type="text/ecmascript-6">
import {addClass} from "@/common/js/dom"
export default {
  name: "slider",

  //props可以接收父级传入的值可以在这里接收到，接收的值必须规定类型和默认值
  props:{
      loop:{    //控制循环播放
          type:Boolean,
          default:true
      },
      autoplay:{    //控制自动播放
          type:Boolean,
          default:true
      },
      interval:{    //切换时间间隔(毫秒)
          type:Number,
          default:3000
      }
  },
  mounted(){//在生命周期mounted（HTML挂载完成）时初始化宽度和slider
        //设置延迟20毫秒延迟是为了等待dom加载完毕。
      setTimeout(() => {
          this._setSliderWidth();//设置轮播图宽度
      },20)
  },
  methods:{
      _setSliderWidth(){//设置轮播图宽度，因为宽度根据设备大小是不一定

        //获取轮播图父级元素，通过它得到下面所有的子元素，即所有的轮播图
        //$refs和html结构中的ref绑定就可以获取这个dom，这是vue绑定dom的方式
        this.children = this.$refs.sliderGroup.children;

        let width = 0; //定义1个宽度常量

        //获取轮播图的宽度，它就等于整个屏幕的宽度。slider元素撑满整个屏幕
        let sliderWidth = this.$refs.slider.clientWidth;

        //循环轮播组件下的所有子元素
        for(let i = 0; i<this.children.length; i++){
            let child = this.children[i];
            addClass(child,'slider-item');//给每个子元素设置样式名
            child.style.width = sliderWidth + 'px';//给每个子元素设置宽度为最外层宽度

            width += sliderWidth;//轮播图的总宽度，把每个子元素的宽度加起来
        }

        if(this.loop){
            //当loop属性(循环比方开启)为true，总宽度还需要增加2个子元素的宽度
            //在轮播图的首尾个增加1个轮播图
            width += sliderWidth * 2
        }
        //设置轮播图父级的宽度，也就是所有子元素宽度的和
        this.$refs.sliderGroup.style.width = width + 'px';
      }
  }

};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.slider{
    .slider-group{
        overflow: hidden;
        .slider-item{
            float: left;
            a {width: 100%;}
            img{width: 100%;}
        }
    }
}
</style>