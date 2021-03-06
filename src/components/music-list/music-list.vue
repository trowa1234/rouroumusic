<template>
    <div class="music-list">
        <div class="back">
            <i class="iconfont icon-back" @click="back"></i>
        </div>
        <h1 class="title" v-html="title"></h1>
        <!-- 歌手头像，绑定style属性，在计算属性中定义bgStyle去写背景样式 -->
        <div class="bg-image" :style="bgStyle" ref="bgImage">
            <!-- 头像的蒙层 -->
            <div class="filter" ref="filter"></div>
            <div class="playbtn" v-show="songs.length>0" ref="playbtn" @click="random">
                <i class="iconfont icon-play"></i>
                <span class="txt">随机播放全部</span>
            </div>
        </div>

        <!-- 在scroll组件上添加一个层，并且绑定dom，需要操作它 -->
        <div class="bg-layer" ref="layer"></div>

        <!-- 同时应用了两个组件，让song-list使用scroll滚动。两个组件都传入了songs数据,scroll是为了计算高度，song-list是为了渲染内容-->
        <!-- 绑定了scroll组件的元素是因为它的top值不定，需要动态计算获取 -->
        <scroll :data="songs" :probe-type="probeType" :listen-scroll="listenScroll" class="list" ref="list" @scroll="scroll">
            <!-- 监听滚动派发出来的滚动事件 -->

            <div class="song-list-wrapper">
                <!-- 接收自定义事件select -->
                <song-list :songs="songs" @select="selectItem" :rank="rank"></song-list>
            </div>
        </scroll>
        <div class="loading-content" v-show="!songs.length">
            <loading class="loading"></loading>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import Scroll from "@/base/scroll/scroll";
import SongList from "@/base/song-list/song-list";
import Loading from "@/base/loading/loading";
import { prefixStyle } from "@/common/js/dom"; //css兼容处理方法
import {mapActions} from 'vuex'; //引入vuex的actions
import {playlistMixin} from '@/common/js/mixin'; //引入公共代码片段

const RESERVED_HEIGHT = 40; //定义顶部高度
const transform = prefixStyle("transform"); //使用css兼容处理方法处理transform
const backdrop = prefixStyle("backdrop-filter"); //使用css兼容处理方法处理backdrop-filter

export default {
    mixins:[playlistMixin], //mixins对象中使用，是1个数组，可以使用多个公共代码
    name: "music-list",
    //此组件需要接收的数据
    props: {
        //歌手头像，字符串地址
        bgImage: {
            type: String,
            default: ""
        },
        //歌手名字
        title: {
            type: String,
            default: ""
        },
        //歌手的所有歌曲，数组
        songs: {
            type: Array,
            default: []
        },
        rank:{
            type:Boolean,
            default:false
        }
    },
    data() {
        return {
            listenScroll: true, //开启scroll组件监听滚动事件
            probeType: 3, //更改滚动类型监视
            scrollY: 0 //保存滚动的实时y轴的值
        };
    },
    computed: {
        //设置样式背景图标为传进来的头像路径
        bgStyle() {
            return `background-image:url(${this.bgImage})`;
        }
    },
    methods: {
        //定义公共代码片段需要的方法。把歌曲列表作为参数传入。注意这里的playlist是从公共代码中传入的
        handlePlaylist(playlist){
            //查看vuex的playlist是否有数据。有的化设置1个bottom值60px,没有的化设置为0
            const bottom = playlist.length > 0 ? '60px' : '0';
            //给这个滚动列表添加bottom样式
            this.$refs.list.$el.style.bottom = bottom;
            //调用滚动插件提供的方法重新计算高度
            this.$refs.list.refresh();
        },
        //监听滚动y轴值
        scroll(pos) {
            this.scrollY = pos.y;
        },
        back() {
            this.$router.back();
        },
        //定义selectItem方法。次方法要控制播放器需要用到vuex的mutations中的多个方法
        selectItem(item,index){
            this.selectPlay({
                list:this.songs,    //传递参数：歌曲列表
                index   //传递参数：点击歌曲的索引值
                //这里我们发现没有使用传递出来的参数item，因为这里我们用不到item，但是作为基础组件song-list尽可能提供多的数据出来，当我们需要时就可以使用
            })
        },
        //点击事件随机播放全部
        random(){
            //调用映射的方法，传入歌曲列表。是以对象的形式传入的，所以vuex的actions中也要以对象形式接收参数
            this.randomPlay({
                list:this.songs
            })
        },
        //vuex的mapActions在methods中调用。注意是数组，引入的函数名字是字符串
        ...mapActions([
            'selectPlay',    //引入actions中的selectPlay函数
            'randomPlay' //随机播放全部歌曲
        ])
    },
    mounted() {
        //获取背景头像的高度
        this.imageHeight = this.$refs.bgImage.clientHeight;
        //设置滚动到顶部距离顶部的最小高度
        this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT;
        //设置滚动列表list的top值为背景头像的高度
        this.$refs.list.$el.style.top = `${this.imageHeight}px`;
    },
    watch: {
        //实现歌单列表向上滚动时遮住背景图，向下拉时背景显示出来
        scrollY(newY) {
            let translateY = Math.max(this.minTranslateY, newY);
            let zIndex = 0;
            let scale = 1;
            let blur = 0;   //定义模糊度

            // this.$refs.layer.style["transform"] = `translate3d(0,${translateY}px,0)`;
            // this.$refs.layer.style["webkitTransform"] = `translate3d(0,${translateY}px,0)`;
            //使用css兼容处理后只需要写一条即可，它会自动添加适合的浏览器前缀
            this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`;

            
            const percent = Math.abs(newY / this.imageHeight);
            if (newY > 0) {
                scale = 1 + percent;
                zIndex = 10;
            } else {
                blur = Math.min(20, percent * 20);  
            }

            // this.$refs.filter.style["backdrop-filter"] = `blur(${blur}px)`;
            // this.$refs.filter.style["webkitBackdrop-filter"] = `blur(${blur}px)`;
            //上滑时模糊背景，只有ios有效
            this.$refs.filter.style[backdrop] = `blur(${blur}px)`;

            //当滚动y轴坐标小于最小高度时
            if (newY < this.minTranslateY) {
                zIndex = 10;    //设置z-index的值
                this.$refs.bgImage.style.paddingTop = 0;    //设置头像背景paddingTop
                this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`;//设置头像背景高度
                this.$refs.playbtn.style.display = "none";  //设置随机播放按钮隐藏
            } else {
                this.$refs.bgImage.style.paddingTop = "70%";
                this.$refs.bgImage.style.height = 0;
                this.$refs.playbtn.style.display = "";
            }

            this.$refs.bgImage.style.zIndex = zIndex;   //设置头像背景z-index的值
            //console.log(zIndex);

            // this.$refs.bgImage.style["transform"] = `scale(${scale})`;
            // this.$refs.bgImage.style["webkitTransform"] = `scale(${scale})`;
            this.$refs.bgImage.style[transform] = `scale(${scale})`;
        }
    },
    components: {
        Scroll,
        SongList,
        Loading
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.music-list {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: @body-bg-grayer;
    .back {
        position: absolute;
        left: 12px;
        top: 6px;
        z-index: 30;
        .icon-back {
            font-size: @iconfont-size-m;
            color: @text-color-yellow;
        }
    }
    .title {
        width: 80%;
        left: 15%;
        position: absolute;
        line-height: 40px;
        z-index: 20;
        font-size: @font-size-medium-x;
        color: @text-color-white;
        text-align: center;
        .text-overflow();
    }
    .bg-image {
        //背景的样式，是设置了height为0，padding-top：70%，来占位的
        position: relative;
        width: 100%;
        padding-top: 70%;
        height: 0;
        transform-origin: top;
        background-size: cover;
        background-color: #222;
        .filter {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(48, 46, 46, 0.5);
        }
        .playbtn {
            position: absolute;
            left: 50%;
            bottom: 10%;
            width: 150px;
            border-radius: 75px;
            margin-left: -85px;
            border: 1px solid @text-color-yellow;
            text-align: center;
            padding: 5px 10px;
            color: @text-color-yellow;
            .txt {
                font-size: @font-size-medium;
                vertical-align: middle;
            }
            .icon-play {
                font-size: 20px;
                vertical-align: middle;
            }
        }
    }
    .bg-layer {
        position: relative;
        height: 100%;
        background: #222;
    }
    .list {
        position: fixed;
        top: 0;
        bottom: 0;
        width: 100%;
        background: #222;
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