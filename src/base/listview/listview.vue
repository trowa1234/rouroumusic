<template>
    <!-- 通过父级传入歌手列表数据到本组件(listview)，再由本组件传向scroll组件中计算滚动距离-->
    <!-- :listenScroll传入初始化配置，允许组件监听滚动 -->
    <!-- @scroll="scroll"绑定的是scroll组件派发出来的自定义事件 -->
    <!-- 当标签属性过多时，建议分行 -->
    <scroll class="listview" :data="data" ref="listview" :listenScroll="listenScroll" :probeType="probeType" @scroll="scroll">
        <ul>
            <!-- 渲染数据：第一层，title和items -->
            <li v-for="(group,index) in data" class="list-group" :key="index" ref="listGroup">
                <!-- 分类的名称 -->
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <!-- 渲染歌手数据:第二层数据，items中的name和avatar -->
                    <li v-for="(item,index) in group.items" 
                        class="list-group-item" 
                        :key="index" 
                        @click="selectItem(item)"><!-- 给歌手列表中每个歌手项绑定点击事件，并且item作为参数传送 -->
                        <img class="avatar" v-lazy="item.avatar" />
                        <span class="name" v-html="item.name"></span>
                    </li>
                </ul>
            </li>
        </ul>
        <!-- 给快速跳转绑定touchstart事件(触摸开始触发)和touchmove事件（触摸移动触发） -->
        <!-- 并且给touchmove添加了修饰符.stop.prevent是了防止点穿，阻止冒泡 -->
        <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <!-- 快速入口绑定样式，到达某个元素区间时，快速入口字母高亮 -->
                <li v-for="(item,index) in shortcutList" class="item" :key="index" :data-index="index" :class="{'current':currentIndex === index}">
                    {{item}}
                </li>
            </ul>
        </div>
        <!-- 歌手列表顶部固定标题是根据返回的title值显示的，如果没有获取到，会隐藏 -->
        <div class="list-fixed" v-show="fixedTitle" ref="listfixed">
            <h2 class="fixed-title">{{fixedTitle}}</h2>
        </div>
        <div class="loading-content" v-show="!data.length">
            <loading class="loading"></loading>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from "@/base/scroll/scroll";
import Loading from "@/base/loading/loading";
import { getData } from "@/common/js/dom"; //引入获取dom元素属性的方法

const ANCHOR_HEIGHT = 20; //定义快速通道每个锚点的高度。由CSS定义的
const TITLE_HEIGHT = 30; //定义歌手列表中标题的高度。由CSS定义的

export default {
    name: "listview",
    data() {
        return {
            touch: {}, //定义1个对象用来存放触摸的距离和触摸的目标元素。方便在多个方法中共享这些数据
            listenScroll: true, //传入的配置允许组件监听滚动
            scrollY: 0, //定义变量存放滚动列表的y轴坐标
            currentIndex: 0, //定义快速入口当前的索引值
            listHeight: [], //定义空数组，用来存放滚动列表每个字母类别的高度
            probeType: 3, //传入的配置，监听实时滚动需要设置scroll组件的probeType属性的值为3
            diff: 0 //定义变量，这个值是用来表示这一项的上限高度和目前滚动位置的滚动差。达到当两个标题相交时有一个向上顶的动画效果
        };
    },
    props: {
        data: {
            type: Array,
            default: []
        }
    },
    computed: {
        // 获取右侧入口文字
        shortcutList() {
            //歌手列表数据使用map()方法。map() 方法返回一个新数组，数组中的元素为原始数组元素调用函数处理后的值。
            return this.data.map(group => {
                //获取title属性并且只去这个值的第一个字符
                return group.title.slice(0, 1);
            });
        },
        //顶部固定标题获取
        fixedTitle() {
            //解决当滚动到最上方时不会同时出现两个标题
            if (this.scrollY > 0) {
                return "";
            }
            //先会判断数据是否存在，存在的话返回title属性，不存在就返回空字符串
            return this.data[this.currentIndex]
                ? this.data[this.currentIndex].title
                : "";
        }
    },
    methods: {
        //歌手项点击事件。因为listview是一个基础组件，在这里不需要定义业务逻辑相关的方法，只负责把点击了哪个元素这个事件传递出去
        selectItem(item){
            //向外派发自定义事件'select',并且把参数item传递出去。这个item就是歌手信息的实例对象
            this.$emit('select',item)
        },
        //快速跳转列表触摸开始事件
        onShortcutTouchStart(e) {
            //获取当前触碰锚点的索引值。data-index属性就是绑定的索引值index
            let anchorIndex = getData(e.target, "index");
            //获取第一个手指触摸信息
            let firstTouch = e.touches[0];
            //开始触摸屏幕时记录y轴的坐标并存入this.touch对象的y1中
            this.touch.y1 = firstTouch.pageY;
            //把触摸到的目标锚点的索引值存入this.touch对象的anchorIndex中
            this.touch.anchorIndex = anchorIndex;
            //调用scroll组件的方法scrollToElement跳转到和锚点索引值一样的歌手列表的索引值。因为这两个索引值是对应的
            this._scrollTo(anchorIndex);
        },
        //快速跳转列表触摸移动事件
        onShortcutTouchMove(e) {
            //获取第一个手指触摸信息
            let firstTouch = e.touches[0];
            //触摸移动时记录y轴的坐标并存入this.touch对象的y2中
            this.touch.y2 = firstTouch.pageY;
            //使用y2-y1就可以得出这次移动的距离，在用这个距离去除以锚点的固定高度，再向下取整，就可以得到移动了多少个锚点
            //向下取整可以用Math.floor()。这里用了"n | 0" (按位与操作符)
            let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0;
            //通过console.log(this.touch)可以看到anchorIndex是字符串形式的。使用当前的index加上之前算出的移动多少个锚点就可以了
            let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
            //再使用scrollToElement()跳转到相应的列表元素。这样就实现了滑动时快速跳转
            this._scrollTo(anchorIndex);
        },
        //从组件派发出来的自定义事件
        scroll(pos) {
            // 通过传递出来的pos参数获取y轴坐标赋值给scrollY
            this.scrollY = pos.y;
        },
        _scrollTo(index) {
            // 因为touch触摸事件是绑定在外层的父容器上的，当触碰到顶部和底部没有字符的地方也会取索引值，所以要做一个限定
            //限定点击边界
            if (!index && index !== 0) {
                return;
            }
            //限定滚动边界。跟上面一样在触发触摸移动事件时滑动到顶部和底部时也会出先问题
            if (index < 0) {
                index = 0;
            } else if (index > this.listHeight.length - 2) {
                index = this.listHeight.length - 2; //使索引值等于它的上限高度的索引值
            }

            //解决点击跳转后右侧入口无高亮效果问题是因为这个scrollToElement这个方法监听不到派发出来的scroll滚动事件，所以需要我们自己添加
            this.scrollY = -this.listHeight[index]; //

            //绑定了srcoll元素调用了它里面的方法，是绑定的listGroup这个元素跳转到索引值相应的位置。
            //第1个参数是跳转到的元素，第2个参数是动画效果（0表示无动画直接跳转）
            this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
        },
        //计算每个类别的元素的高度
        _calculateHeight() {
            this.listHeight = []; //空数组，存放每个元素高度
            const list = this.$refs.listGroup; //绑定滚动列表中每一项的dom元素
            let height = 0; //初始高度为0，第1个元素的y坐标
            this.listHeight.push(height); //添加到数组中
            //遍历滚动列表中每一个元素
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                height += item.clientHeight; //累加每个元素的高度
                this.listHeight.push(height); //每次累加的高度添加到数组。滚动列表每一项元素的高度都被添加到数组中
            }
        },
        //从scroll插件中曝露出来的方法，定义一个方法再曝露它给父级singer组件使用
        refresh(){
            this.$refs.listview.refresh();
        }
    },
    watch: {
        //监听数据，当列表数据发生变化时，重新计算每一项元素的高度
        data() {
            setTimeout(() => {
                this._calculateHeight();
            }, 20);
        },
        //监听滚动列表实时的y坐标值，用前面计算出来的每一项元素所在高度和当前的y值做比较，从而得到当前所在的区间
        scrollY(newY) {
            const listHeight = this.listHeight;

            //**当滚动到顶部时，newY>0
            if (newY > 0) {
                this.currentIndex = 0;
                return;
            }

            //**当在中间部分滚动时
            //循环时循环次数(高度数组的个数)-1，是因为按元素个数来循环,高度都是两个1组的
            for (let i = 0; i < listHeight.length - 1; i++) {
                //定义两个高度，用于获取区间做对比。在高度1和高度2之间就是1元素的区间
                let height1 = listHeight[i]; //第1个高度代表，元素高度起始位置
                let height2 = listHeight[i + 1]; //第2个高度代表，元素高度结束位置

                //-newY是为了保证y坐标为正数好跟高度做比较
                //当y坐标值大于height1小于height2时，说明现在屏幕显示的就是这个区间，而当前高度的索引值就是i，这个索引值和列表的索引值是相对应的
                //当没有获取到height2时说明已经是最后1项，直接把当前索引值赋值
                if (-newY >= height1 && -newY < height2) {
                    this.currentIndex = i;

                    this.diff = height2 + newY; //计算滚动差，元素的高度上限 + 目前的y坐标
                    return;
                }
            }

            //**当滚动到底部时，-newY大于最后一个元素的上限时。
            this.currentIndex = listHeight.length - 2; //使索引值等于它的上限高度的索引值
        },
        //监听diff这个值，当diff发送变化时，操作绑定的元素dom
        diff(newVal) {
            let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
            
            if (this.fixedTop === fixedTop) {
                return;
            }
            this.fixedTop = fixedTop;
            //console.log(this.fixedTop);
            this.$refs.listfixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`;
        }
    },
    components: {
        Scroll,
        Loading
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.listview {
    height: 100%;
    overflow: hidden;
    font-size: @font-size-medium;
    position: relative;
    .list-group {
        .list-group-title {
            font-size: @font-size-medium;
            line-height: 30px;
            background: rgba(97, 96, 96, 1);
            padding-left: 20px;
            color: @text-color-white;
        }
        .list-group-item {
            display: flex;
            padding: 10px 20px;
            .avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                flex: 0 0 60px;
                margin-right: 20px;
            }
            .name {
                flex: 1;
                line-height: 60px;
            }
        }
    }
    .list-shortcut {
        position: absolute;
        right: 0;
        top: 50px;
        padding: 16px 2px;
        background: rgba(19, 18, 18, 0.8);
        border-radius: 10px;
        .item {
            text-align: center;
            font-size: @font-size-medium;
            color: @text-color-white;
            line-height: 20px;
        }
        .current {
            color: @body-bg-yellow;
        }
    }
    .list-fixed {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        .fixed-title {
            font-size: @font-size-medium;
            line-height: 30px;
            background: rgba(97, 96, 96, 1);
            padding-left: 20px;
            color: @text-color-white;
        }
    }
    .loading-content {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(2, 2, 2, 0.4);
        .loading{
            position: absolute;
            top: 50%;
            transform: translateY(-50%);  //垂直居中
        }
  }
}
</style>