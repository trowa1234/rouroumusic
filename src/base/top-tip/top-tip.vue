<template>
    <transition name="drop">
        <div class="top-tip" v-show="showTip" @click.stop="hide">
            <slot></slot>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
export default {
    name: "top-tip",
    props:{
        //显示时间
        delay:{
            type:Number,
            default:2000
        }
    },
    data() {
        return {
            showTip: false
        };
    },
    methods:{
        show(){
            this.showTip = true;

            //顶部提示，到指定时间隐藏
            clearTimeout(this.timer);//清除定时器，保证多次点击造成延迟队列
            this.timer = setTimeout(() => {
                this.hide()
            },this.delay)
        },
        hide(){
            this.showTip = false;
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.top-tip{
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 500;
    background-color: #666;
    &.drop-enter-active,&.drop-leave-active{
        transition: all 0.3s;
    }
    &.drop-enter,&.drop-leave-to{
        transform: translate3d(0,-100%,0);
    }
}
</style>