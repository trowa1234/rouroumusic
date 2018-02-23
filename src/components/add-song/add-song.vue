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
            <div class="search-box-wrapper">
                <!-- 接收search-box组件派发处理的query事件,调用onQueryChange在公共代码中 -->
                <search-box @query="onQueryChange" placeholder="搜索歌曲" ref="searchBox"></search-box>
            </div>
            <div class="shortcut" v-show="!query">
                <!-- 监听switches组件的switch事件(点击事件) -->
                <switches @switch="switchItem" 
                          :switches="switches" 
                          :switchesCurrentIndex="switchesCurrentIndex">
                </switches>
                <div class="list-wrapper">
                    <!-- 播放历史列表使用scroll组件，当switches组件的索引值为0时才显示 -->
                    <scroll ref="songList" class="list-scroll" v-if="switchesCurrentIndex===0" :data="playHistory">
                        <div class="list-inner">
                            <!-- 播放播放历史列表内容。监听点击事件，点击可以添加歌曲到歌曲列表 -->
                            <song-list @select="selectSong" :songs="playHistory"></song-list>
                        </div>
                    </scroll>

                    <!-- 搜索历史列表也使用scroll组件，当switches组件的索引值为1时才显示 -->
                    <!-- refreshDelay延迟计算高度时间，定义在searchMixin中 -->
                    <scroll :refreshDelay="refreshDelay" ref="searchList" class="list-scroll" v-if="switchesCurrentIndex===1" :data="searchHistory">
                        <div class="list-inner">
                            <!-- 接收搜索历史列表点击事件select，把选中的字符添加到搜索栏。这些方法都在searchMixin中 -->
                            <!-- 接收“×”图标点击事件delete，把对应的搜索结果行删除 -->
                            <search-list class="search-list" @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
                        </div>
                    </scroll>
                </div>
            </div>
            <div class="search-result" v-show="query">
                <!-- search组件中监听这个滚动开始事件listScroll，通过了两层传递 -->
                <!-- 接收select事件保存当前搜索字段(query值) -->
                <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
            </div>
            <top-tip ref="topTip">
                <div class="tip-title">
                    <i class="iconfont icon-ok"></i>
                    <span class="text">1首歌曲已经添加到播放队列</span>
                </div>
            </top-tip>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
import SearchBox from "@/base/search-box/search-box";
import Suggest from "@/components/suggest/suggest";
import { searchMixin } from "@/common/js/mixin"; //搜索功能、保存搜索历史记录复用
import Switches from "@/base/switches/switches";
import {mapGetters, mapActions} from "vuex";
import Scroll from "@/base/scroll/scroll";
import SongList from "@/base/song-list/song-list";
import Song from "@/common/js/song";
import SearchList from "@/base/search-list/search-list";
import TopTip from "@/base/top-tip/top-tip";

export default {
    mixins: [searchMixin],
    name: "add-song",
    data() {
        return {
            showFlag: false, //控制显示隐藏
            showSinger: false, //出入suggest组件的配置，搜索结果是否显示歌手
            switchesCurrentIndex:0, //switches组件配置，当前索引值
            switches:[              //switches组件配置,按钮名字，个数
                {name:"最近播放"},
                {name:"搜索历史"}
            ]
        };
    },
    computed:{
        ...mapGetters([
            "playHistory"   //已经播放历史列表
        ])
    },
    methods: {
        show() {
            this.showFlag = true;
            //由于add-song组件默认是隐藏，里面的两个滚动列表计算高度不正确
            //所以需要在显示时重新计算高度，注意需要延迟20毫秒执行，不然也不能计算高度
            setTimeout(() => {
                if(this.switchesCurrentIndex === 0 ){
                    this.$refs.songList.refresh();
                }else{
                    this.$refs.searchList.refresh();
                }
            },20)
        },
        hide() {
            this.showFlag = false;
        },
        //switches组件的点击事件
        switchItem(index){
            //修改当前索引值为点击项的索引值
            this.switchesCurrentIndex = index;
        },
        //点击搜索列表事件
        selectSuggest(){
            //保存当前搜索字段(query值)
            this.saveSearch();

            //在搜索列表中点击播放歌曲后显示顶部提示
            this.showTip();
        },
        //点击播放历史列表中的歌曲
        selectSong(song,index){
            //当点击的不是第1项的时候。因为第1项就是当前播放的歌曲
            if(index !== 0){
                this.insertSong(new Song(song))
            }

            //在播放历史列表点击播放歌曲后显示顶部提示
            this.showTip();
        },
        //顶部提示信息显示
        showTip(){
            this.$refs.topTip.show();
        },
        ...mapActions([
            "insertSong"  //实现点击列表中歌曲，添加这首歌曲到当前播放列表
        ])
    },
    components: {
        SearchBox,
        Suggest,
        Switches,
        Scroll,
        SongList,
        SearchList,
        TopTip
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.add-song {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 350;
    background-color: #222;
    &.slide-enter-active,
    &.slide-leave-active {
        transition: all 0.3s;
    }
    &.slide-enter,
    &.slide-leave-to {
        transform: translate3d(100%, 0, 0);
    }
    .header {
        width: 100%;
        position: relative;
        height: 44px;
        text-align: center;
        .title {
            line-height: 44px;
            font-size: @font-size-medium-x;
            color: @text-color-white;
        }
        .close {
            position: absolute;
            top: 0;
            right: 8px;
            .text-overflow();
            .icon-delete {
                font-size: @iconfont-size-l;
                color: @theme-yellow;
            }
        }
    }
    .search-box-wrapper{
        margin: 20px;
    }
    .shortcut{
        .list-wrapper{
            position: absolute;
            top: 165px;
            bottom: 0;
            width: 100%;
            .list-scroll{
                height: 100%;
                overflow: hidden;
                .list-inner{
                    padding: 20px 30px;
                    .search-list{
                        margin: 0 20px;
                    }
                }
            }
        }
    }
    .search-result{
        position: fixed;
        top:124px;
        bottom: 0;
        width: 100%;
    }
    .tip-title{
        text-align: center;
        padding: 18px 0;
        .icon-ok{
            font-size: 14;
            color: @theme-yellow;
            margin-right: 4px;
        }
        .text{
            font-size: @font-size-medium;
            color: @theme-yellow;
        }
    }
}
</style>