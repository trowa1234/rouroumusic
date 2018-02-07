<template>
    <!-- ref就是绑定dom元素。绑定了最外层的dom和装轮播图的dom -->
    <div class="slider" ref="slider">
        <div class="slider-group" ref="sliderGroup">
            <!-- 使用插槽装内容 -->
            <slot>
            </slot>
        </div>
        <div class="dots">
            <!-- 根据数组dots的长度渲染出圆点的个数。绑定样式active，当设置的当前索引currentPageIndex等于循环中的索引时就添加该样式。 -->
            <span class="dot" v-for="(item,index) in dots" :class="{active:currentPageIndex === index}" :key="index"></span>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import { addClass } from "@/common/js/dom"; //引入添加样式方法
import BScroll from "better-scroll"; //引入better-scroll插件
export default {
    name: "slider",
    data() {
        return {
            dots: [], //定义圆点组为1个空数组
            currentPageIndex: 0 //定义当前也面为第1页
        };
    },
    //props可以接收父级传入的值可以在这里接收到，接收的值必须规定类型和默认值
    props: {
        loop: {
            //控制循环播放
            type: Boolean,
            default: true
        },
        autoPlay: {
            //控制自动播放
            type: Boolean,
            default: true
        },
        interval: {
            //切换时间间隔(毫秒)
            type: Number,
            default: 3000
        }
    },

    //在生命周期mounted（HTML挂载完成）时初始化宽度和slider
    //mounted生命周期是在created之后，slot插槽中还没有加载。所以在父组件recommend组件中我们用了v-if先等轮播数据加载完毕后，再渲染slider组件
    mounted() {
        //设置延迟20毫秒延迟是为了等待dom加载完毕。
        setTimeout(() => {
            this._setSliderWidth(); //设置轮播图宽度
            this._initDots(); //获取圆点个数，只能放在初始化插件前面。否则会收到初始化loop参数的影响，为true时会多2个子元素
            this._initSlider(); //初始化插件

            //如果自动播放是开启的，进入页面就执行一次play方法
            if (this.autoPlay) {
                this._play();
            }
        }, 20);

        /*  //也可以用$nextTick()这个方法等待dom加载。将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。
        this.$nextTick(() => {
            this._setSliderWidth();
            this._initDots(); 
            this._initSlider(); 
            if (this.autoPlay) {
                this._play();
            }
        }); */
    },
    methods: {
        //设置轮播图宽度，因为宽度根据设备大小是不一定
        _setSliderWidth() {
            //获取轮播图父级元素，通过它得到下面所有的子元素，即所有的轮播图
            //$refs和html结构中的ref绑定就可以获取这个dom，这是vue绑定dom的方式
            this.children = this.$refs.sliderGroup.children;

            let width = 0; //定义1个宽度

            //获取轮播图的宽度，它就等于整个屏幕的宽度。slider元素撑满整个屏幕
            let sliderWidth = this.$refs.slider.clientWidth;

            //循环轮播组件下的所有子元素
            for (let i = 0; i < this.children.length; i++) {
                let child = this.children[i];
                addClass(child, "slider-item"); //给每个子元素设置样式名
                child.style.width = sliderWidth + "px"; //给每个子元素设置宽度为最外层宽度

                width += sliderWidth; //轮播图的总宽度，把每个子元素的宽度加起来
            }

            if (this.loop) {
                //当loop属性(循环比方开启)为true，总宽度还需要增加2个子元素的宽度
                //在轮播图的首尾个增加1个轮播图
                width += 2 * sliderWidth;
            }
            //设置轮播图父级的宽度，也就是所有子元素宽度的和
            this.$refs.sliderGroup.style.width = width + "px";
        },

        //初始化插件
        _initSlider() {
            //this.slider(.后面的slider可以随意命名)是一个实例化对象
            //构造函数需要传入两个参数，第1个参数是需要滚动元素的父级的dom，第2个参数就是一些配置参数
            this.slider = new BScroll(this.$refs.slider, {
                scrollX: true, //允许横向滚动
                scrollY: false, //不允许纵向滚动
                momentum: false, //禁用惯性
                snap: { loop: this.loop, threshold: 0.3, speed: 400 }, //snap参数是1个对象：loop循环播放，speed动画切换速度,threshold表示可滚动到下一个的阈值
                click: true
            });

            //绑定滚动结束事件，每次滚动结束后触发
            this.slider.on("scrollEnd", () => {
                //使用插件提供的方法获取当前所在项的索引值
                console.log(this.slider.getCurrentPage());
                let pageIndex = this.slider.getCurrentPage().pageX; //当前索引值

                //设置索引值为轮播图当前索引值
                this.currentPageIndex = pageIndex;

                //当自动播放开启时
                if (this.autoPlay) {
                    //先清楚定时器，这是为了保证滚动后计时器都是从0开始计时
                    clearTimeout(this.timer);
                    //再执行play()方法，因为执行就会滚动，滚动就会触发结束事件，以此来达到一直自动播放
                    this._play();
                }
            });
        },

        //获取圆点的个数
        _initDots() {
            //把dots赋值为长度为轮播图个数的空数组
            //this.children就是在_setSliderWidth中获取到的，在这里可以直接使用
            //console.log(this.children.length);
            this.dots = new Array(this.children.length);
        },

        //自动播放
        _play() {
            //设置当前索引增加1
            let pageIndex = this.currentPageIndex + 1;
            //当索引等于轮播图的长度时，将索引设为0，重新开始
            if (pageIndex === this.dots.length) {
                pageIndex = 0;
            }
            //使用setTimeout延迟，用props传入的interval作为延迟的事件
            this.timer = setTimeout(() => {
                //使用插件提供的方法goToPage()跳转到索引对应的页面
                //第1个参数x横轴的页数，第2个参数y横轴的页数，第3个参数滚动动画的时间
                this.slider.goToPage(pageIndex, 0, 400);
            }, this.interval);
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.slider {
    position: relative;
    .slider-group {
        overflow: hidden;
        white-space: nowrap;
        .slider-item {
            float: left;
            a {
                width: 100%;
                display: block;
            }
            img {
                width: 100%;
                display: block;
            }
        }
    }
    .dots {
        position: absolute;
        left: 50%;
        bottom: 10%;
        margin-left: -50px;
        text-align: center;
        .dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: rgba(231, 226, 226, 0.9);
            margin-left: 10px;
            border-radius: 8px;
        }
        .dot.active {
            width: 20px;
            background: @text-color-yellow;
        }
    }
}
</style>