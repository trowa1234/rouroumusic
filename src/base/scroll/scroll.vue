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
        //scroll事件派发形式
        probeType: {
            type: Number,
            default: 1
        },
        //是否允许点击事件
        click: {
            type: Boolean,
            default: true
        },
        //滚动的距离是根据数据来计算的，如果数据发送变化，可以监听数据重新计算距离
        data: {  
            type: Array,
            default: []
        },
        //是否允许组件监听滚动事件
        listenScroll: {
            type: Boolean,
            default: false
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

            //如果允许监听滚动事件
            if(this.listenScroll){
                //在外部保存this，因为在事件中的this指向的是scroll
                let me = this
                //监听滚动事件，参数pos就是当代滚动的坐标位置，包括x轴和y轴的坐标值   
                this.scroll.on('scroll',(pos) => {
                    //使用$emit把这个事件派发给父组件，父组件绑定'scroll'事件就可以接收
                    me.$emit('scroll',pos)
                })
            }
        },
        //一下定义这些方法是为了方便内部和外部调用。这些方法都是插件提供的方法
        //启动滚动方法
        enable() {
            this.scroll && this.scroll.enable();
        },
        //禁用滚动方法
        disable() {
            this.scroll && this.scroll.disable();
        },
        //重新计算dom滚动距离方法
        refresh() {
            this.scroll && this.scroll.refresh();
        },
        //使列表滚动到指定的参数
        scrollTo() {
            this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
        },
        //使列表滚动到指定的元素
        scrollToElement() {
            this.scroll &&
                this.scroll.scrollToElement.apply(this.scroll, arguments);
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

</style>