<template>
    <div class="recommend">
        <scroll class="recommend-content" :data="discList">
            <div>
                <!-- v-if，注意这里一定要得到数据后再开始后面的循环渲染，否则slider组件中无法计算宽度 -->
                <div v-if="recommendSlider.length" class="slider-wrapper">
                    <slider>
                        <!-- 这里就是填充slider组件中slot标签的内容。这里可以不绑定key -->
                        <div v-for="(item,index) in recommendSlider" v-bind:key="index">
                            <a :href="item.linkUrl">
                                <img :src="item.picUrl" />
                            </a>
                        </div>
                    </slider>
                </div>
                <div class="recommend-list">
                    <h2 class="hot-tit">热门歌单推荐</h2>
                    <ul>
                        <li v-for="(item,index) in discList" class="item" :key="index">
                            <div class="pic">
                                <img :src="item.imgurl" alt="">
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
    </div>
</template>

<script type="text/ecmascript-6">
//export曝露的所以需要{}
import { getRecommend, getDiscList } from "@/api/recommend"; //引入获取推荐页面数据的方法
import { ERR_OK } from "@/api/config"; //引入返回成功code

import Slider from "@/base/slider/slider"; //引入轮播组件
import Scroll from "@/base/scroll/scroll"; //引入轮播组件

export default {
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
        }
    },
    components: {
        Slider,
        Scroll
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.recommend {
    position: fixed;
    top: 88px;
    width: 100%;
    height: 100%;
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
                    font-size: @font-size-small;
                    margin-top: 8px;
                }
            }
        }
    }
}
</style>