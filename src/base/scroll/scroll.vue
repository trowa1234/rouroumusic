<template>
    <div ref="wrapper" class="wrapper">
        <slot></slot>
    </div>
</template>

<script type="text/ecmascript-6">
import BScroll from "better-scroll";

export default {
    name: "scroll",
    //从父组件中获取传递过来的参数由props接收
    props: {
        probeType: {
            //scroll事件派发形式
            type: Number,
            default: 1
        },
        click: {
            //是否允许点击事件
            type: Boolean,
            default: true
        },
        data: {
            //滚动的距离是根据数据来计算的，如果数据发送变化，可以监听数据重新计算距离
            type: Array,
            default: []
        }
    },
    //当dom加载完毕时初始化插件
    mounted() {
        setTimeout(() => {
            this._initScroll();
        }, 20);
    },
    methods: {
        //初始化插件方法
        _initScroll() {
            if (!this.$refs.wrapper) {
                //判断dom是否加载
                return;
            }
            //传入参数，初始化插件
            this.scroll = new BScroll(this.$refs.wrapper, {
                probeType: this.probeType,
                click: this.click
            });
        },
        //一下定义这些方法是为了方便调用
        //插件提供-启动滚动方法
        enable() {
            this.scroll && this.scroll.enable();
        },
        //插件提供-禁用滚动方法
        disable() {
            this.scroll && this.scroll.disable();
        },
        //插件提供-重新计算dom滚动距离方法
        refresh() {
            this.scroll && this.scroll.refresh();
        }
    },
    watch: {
        //监听。
        //监听传递进来的data数据，发送变化就调用refresh()方法重新计算
        data() {
            setTimeout(() => {
                this.refresh();
            }, 20);
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.wrapper {
    height: 100%;//这两个属性必须写，否则滚动不了
    overflow: hidden;
}
</style>