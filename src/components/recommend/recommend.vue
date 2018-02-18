<template>
    <div class="recommend" ref="recommend">
        <!-- 把歌单列表数据传入scroll组件中，以便计算滚动距离。绑定了scroll的dom元素，可以使用scroll中定义的方法 -->
        <scroll ref="scroll" class="recommend-content" :data="discList">
            <div>
                <!-- v-if，注意这里一定要得到数据后再开始后面的循环渲染，否则slider组件中无法计算宽度 -->
                <div v-if="recommendSlider.length" class="slider-wrapper">
                    <slider>
                        <!-- 这里就是填充slider组件中slot标签的内容。这里可以不绑定key -->
                        <div v-for="(item,index) in recommendSlider" v-bind:key="index">
                            <a :href="item.linkUrl">
                                <!-- 给轮播图绑定load事件。轮播图区域是开图片撑开高度的，所以在图片上绑定一个事件，用来监控图片是否加载完成，如果加载完成就重新计算滚动距离 -->
                                <img @load="loadImage" :src="item.picUrl" />
                            </a>
                        </div>
                    </slider>
                </div>
                <div class="recommend-list">
                    <h2 class="hot-tit">热门歌单推荐</h2>
                    <ul>
                        <li v-for="(item,index) in discList" class="item" :key="index">
                            <div class="pic">
                                <!-- 原来用的是:src，懒加载用v-lazy -->
                                <img v-lazy="item.imgurl" />
                            </div>
                            <div class="text">
                                <h3 class="creator" v-html="item.creator.name"></h3>
                                <p class="discname" v-html="item.dissname"></p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </scroll>
        <!-- loading组件需要一个外层来进行遮罩和使用v-show来控制显示的时机，当歌单数据加载出来后就隐藏 -->
        <div class="loading-content" v-show="!discList.length">
            <loading></loading>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
//export曝露的所以需要{}
import { getRecommend, getDiscList } from "@/api/recommend"; //引入获取推荐页面数据的方法
import { ERR_OK } from "@/api/config"; //引入返回成功code
import Slider from "@/base/slider/slider"; //引入轮播组件
import Scroll from "@/base/scroll/scroll"; //引入滚动组件
import Loading from "@/base/loading/loading"; //引入加载组件
import { playlistMixin } from "@/common/js/mixin"; //引入公共代码片段

export default {
    mixins:[playlistMixin],
    name: "recommend",
    data() {
        //data中的值必须由return返回
        return {
            recommendSlider: [], //接收轮播图数据的空数组
            discList: [] //接歌单数据的空数组
        };
    },
    created() {
        //在生命周期created（页面被创建时）这个钩子函数中调用
        this._getRecommend(); //获取轮播数据。在methods中进行了包装，也可直接在此调用getRecommend
        this._getDiscList();
    },
    methods: {
        //定义公共代码片段需要的方法。把歌曲列表作为参数传入。注意这里的playlist是从公共代码中传入的
        handlePlaylist(playlist){
            //查看vuex的playlist是否有数据。有的化设置1个bottom值60px,没有的化设置为0
            const bottom = playlist.length > 0 ? '60px' : '0';
            //给这个滚动列表添加bottom样式
            this.$refs.recommend.style.bottom = bottom;
            //重新计算高度。这个方法在需要从listview组件中曝露出来，绑定listview
            this.$refs.scroll.refresh();
        },
        _getRecommend() {
            //轮播数据
            //getRecommend()返回的其实是Promise对象，所以这里用了.then接收数据
            getRecommend().then(res => {
                if (res.code === ERR_OK) {
                    //console.log(res); //返回的是所有的数据
                    //console.log(res.data.slider); //轮播数据是一个数组
                    this.recommendSlider = res.data.slider; //赋值给空数组
                }
            });
        },
        _getDiscList() {
            //歌单数据
            getDiscList().then(res => {
                if (res.code === ERR_OK) {
                    this.discList = res.data.list;
                    //console.log(this.discList);
                }
            });
        },
        //图片加载事件
        loadImage() {
            //轮播图有多张图片，此事件会触发多次，所以设置1个标志this.oneLoaded。
            if (!this.oneLoaded) {
                //当触发1次时就会调用scroll内部的方法计算滚动距离
                this.$refs.scroll.refresh();
                //然后把这个标志设置为true，那么下次再触发图片加载事件时if语句就不回再进来了
                this.oneLoaded = true;
            }
        }
    },
    components: {
        Slider,
        Scroll,
        Loading
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.recommend {
    position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%;
    .recommend-content {
        //此样式是scroll组件的必须有这两个样式才能达到滚动效果。可以在scroll组件里面设置好，外面就可以不用加了
        height: 100%;
        overflow: hidden;
        .recommend-list {
            .hot-tit {
                font-size: @font-size-medium-x;
                font-weight: bold;
                text-align: center;
                line-height: 40px;
                color: @text-color-yellow;
            }
            .item {
                display: flex;
                padding: 10px;
                .pic {
                    flex: 0 0 60px;
                    margin-right: 20px;
                    img {
                        width: 60px;
                        height: 60px;
                    }
                }
                .text {
                    .creator {
                        font-size: @font-size-medium;
                        line-height: 20px;
                    }
                    .discname {
                        font-size: @font-size-medium;
                        color: @text-color-lighter;
                        margin-top: 8px;
                    }
                }
            }
        }
    }
    .loading-content {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(2, 2, 2, 0.4);
    }
}
</style>