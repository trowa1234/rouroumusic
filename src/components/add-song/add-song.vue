<template>
    <transition name="slide">
        <div class="add-song" v-show="showFlag" @click.stop>
            <div class="header">
                <h1 class="title">添加歌曲到列表</h1>
                <!-- 关闭按钮，点击隐藏组件 -->
                <div class="close" @click="hide">
                    <i class="iconfont icon-delete"></i>
                </div>
            </div>
            <div class="search-box-wrapper"></div>
            <div class="shortcut"></div>
            <div class="search-result"></div>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
export default {
    name: "add-song",
    data() {
        return {
            showFlag: false
        };
    },
    methods:{
        show(){
            this.showFlag = true;
        },
        hide(){
            this.showFlag = false;
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.add-song{
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 350;
    background-color:#222;
    &.slide-enter-active, &.slide-leave-active{
        transition: all 0.3s;
    }
    &.slide-enter, &.slide-leave-to{
        transform: translate3d(100%,0,0)
    }
    .header{
        width: 100%;
        position: absolute;
        height: 44px;
        text-align: center;
        .title{
            line-height: 44px;
            font-size: @font-size-medium-x;
            color: @text-color-white;
        }
        .close{
            position: absolute;
            top: 0;
            right: 8px;
            .text-overflow();
            .icon-delete{
                font-size: @iconfont-size-l;
                color: @theme-yellow;
            }
        }
    }
}
</style>