<template>
    <!-- 通过父级传入歌手列表数据到本组件(listview)，再由本组件传向scroll组件中计算滚动距离-->
    <scroll class="listview" :data="data" ref="listview">
        <ul>
            <!-- 渲染数据：第一层，title和items -->
            <li v-for="(group,index) in data" class="list-group" :key="index" ref="listGroup">
                <!-- 分类的名称 -->
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <!-- 渲染歌手数据:第二层数据，items中的name和avatar -->
                    <li v-for="(item,index) in group.items" class="list-group-item" :key="index">
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
                <li v-for="(item,index) in shortcutList" class="item" :key="index" :data-index="index">{{item}}</li>
            </ul>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from "@/base/scroll/scroll"
import {getData} from "@/common/js/dom" //引入获取dom元素属性的方法

const ANCHOR_HEIGHT = 20;   //定义快速通道每个锚点的高度。由CSS定义的

export default {
    name: "listview",
    created(){
        this.touch ={}  //定义1个对象用来存放触摸的距离
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
        }
    },
    methods:{
        //快速跳转列表触摸开始事件
        onShortcutTouchStart(e){
            //获取当前触碰锚点的索引值。data-index属性就是绑定的索引值index
            let anchorIndex = getData(e.target,'index')
            //获取第一个手指触摸信息
            let firstTouch = e.touches[0]
            //开始触摸屏幕时记录y轴的坐标并存入this.touch对象的y1中
            this.touch.y1 = firstTouch.pageY
            //把触摸到的目标锚点的索引值存入this.touch对象的anchorIndex中   
            this.touch.anchorIndex = anchorIndex
            //调用scroll组件的方法scrollToElement跳转到和锚点索引值一样的歌手列表的索引值。因为这两个索引值是对应的
            this._scrollTo(anchorIndex)
        },
        ////快速跳转列表触摸移动事件
        onShortcutTouchMove(e){
            //获取第一个手指触摸信息
            let firstTouch = e.touches[0]
            //触摸移动时记录y轴的坐标并存入this.touch对象的y2中
            this.touch.y2 = firstTouch.pageY
            //使用y2-y1就可以得出这次移动的距离，在用这个距离去除以锚点的固定高度，再向下取整，就可以得到移动了多少个锚点
            //向下取整可以用Math.floor()。这里用了"n | 0" (按位与操作符)
            let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
            //通过console.log(this.touch)可以看到anchorIndex是字符串形式的。使用当前的index加上之前算出的移动多少个锚点就可以了
            let anchorIndex = parseInt(this.touch.anchorIndex) + delta
            //再使用scrollToElement()跳转到相应的列表元素。这样就实现了滑动时快速跳转
            this._scrollTo(anchorIndex)
        },
        _scrollTo(index){//绑定了srcoll元素调用了它里面的方法，是绑定的listGroup这个元素跳转到索引值相应的位置
            this.$refs.listview.scrollToElement(this.$refs.listGroup[index],0)
        }
    },
    components: {
        Scroll
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.listview {
    font-size: @font-size-medium-x;
    position: relative;
    .list-group {
        .list-group-title {
            font-size: @font-size-medium;
            line-height: 30px;
            background: rgba(97, 96, 96, 0.5);
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
        right: 5px;
        top: 50px;
        padding: 16px 2px;
        background: rgba(19, 18, 18, 0.5);
        border-radius: 10px;
        .item{
            text-align: center;font-size: @font-size-medium;color: @text-color-white;line-height: 20px;
        }
    }
}
</style>