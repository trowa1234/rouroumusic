<template>
    <ul class="switches">
        <!-- 绑定样式来控制高亮效果 -->
        <!-- 绑定点击事件，传入参数点击目标的索引值 -->
        <li class="switch-item" 
            v-for="(item,index) in switches" 
            :key="item" 
            :class="{'active':switchesCurrentIndex === index}"
            @click="switchItem(index)"
        >
            <!-- name属性为按钮文字 -->
            <span>{{item.name}}</span>
        </li>
    </ul>
</template>

<script type="text/ecmascript-6">
export default {
  name: "switches",
  props:{
      //根据数组中对象的个数渲染按钮数量，对象中的name属性为按钮名字
      switches:{
          type:Array,
          default:[]
      },
      //当前索引值，默认为0。
      switchesCurrentIndex:{
          type:Number,
          default:0
      }
  },
  methods:{
      //点击事件
      switchItem(index){
          //只负责派发自定义事件出去，并且把点击的索引值传出去
          this.$emit('switch',index);
      }
  }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.switches{
    display: flex;
    align-items: center;
    width: 68%;
    margin: 0 auto;
    border: 1px solid @body-bg-blacker;
    border-radius: 5px;
    .switch-item{
        flex: 1;
        padding: 8px;
        text-align: center;
        font-size: @font-size-medium;
        color: @text-color-lighter;
        &.active{
            background-color: @body-bg-blacker;
            color: @text-color-white;
        }
    }
}
</style>