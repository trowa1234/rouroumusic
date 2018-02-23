<template>
    <transition name="slide">
        <div class="user-center">
            <div class="back" @click="back">
                <i class="iconfont icon-back"></i>
            </div>
            <div class="switches-wrapper">
                <switches @switch="switchItem" :switches="switches" :switchesCurrentIndex="switchesCurrentIndex"></switches>
            </div>
            <div class="play-btn" ref="playBtn" @click="random">
                <i class="iconfont icon-play"></i>
                <span class="text">随机播放全部</span>
            </div>
            <div class="list-wrapper" ref="listWrapper">
                <!-- 收藏列表使用scroll组件，当switches组件的索引值为0时才显示 -->
                <scroll ref="favoriteList" class="list-scroll" v-if="switchesCurrentIndex===0" :data="favoriteList">
                    <div class="list-inner">
                        <!-- 收藏列表内容。监听点击事件，点击可以添加歌曲到歌曲列表 -->
                        <song-list @select="selectSong" :songs="favoriteList"></song-list>
                    </div>
                </scroll>

                <!-- 播放历史列表也使用scroll组件，当switches组件的索引值为1时才显示 -->
                <scroll  ref="playHistory" class="list-scroll" v-if="switchesCurrentIndex===1" :data="playHistory">
                    <div class="list-inner">
                        <!-- 播放历史列表内容。监听点击事件，点击可以添加歌曲到歌曲列表 -->
                        <song-list @select="selectSong" :songs="playHistory"></song-list>
                    </div>
                </scroll>
            </div>
            <!-- 没有数据时显示，由noResult来控制显示 -->
            <div class="no-result-wrapper" v-show="noResult">
                <no-result :text="noResultDesc"></no-result>
            </div>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
import Switches from "@/base/switches/switches";
import {mapGetters,mapActions} from "vuex";
import Scroll from "@/base/scroll/scroll";
import SongList from "@/base/song-list/song-list";
import Song from "@/common/js/song";
import {playlistMixin} from "@/common/js/mixin";
import NoResult from "@/base/no-result/no-result";

export default {
    mixins:[playlistMixin],
    name: "user-center",
    data() {
        return {
            switchesCurrentIndex: 0, //switches组件配置，当前索引值
            switches:[  //switches组件配置,按钮名字，数组的length就是按钮的个数
                {name:'我喜欢的'},
                {name:'最近听的'}
            ]
        };
    },
    computed:{
        //控制no-result显示。这里要分两种情况：
        noResult(){
            //1种在收藏列表页时，没有收藏列表数据时显示
            if(this.switchesCurrentIndex === 0){
                return !this.favoriteList.length
            } else{//1种在播放历史列表页时，没有播放历史列表时显示
                return !this.playHistory.length
            }
        },
        noResultDesc(){
            if(this.switchesCurrentIndex === 0){
                return "暂无收藏歌曲"
            } else{
                return "你还没有听过歌曲"
            }
        },
        ...mapGetters([
            "favoriteList", //收藏列表数据
            "playHistory"   //播放历史列表数据
        ])
    },
    methods:{
        back(){
            this.$router.back();//调用路由后退方法
        },
        //点击swiches组件切换按钮高亮
        switchItem(index){
            this.switchesCurrentIndex = index;
        },
        selectSong(song){
            //console.log(song);
            //console.log(new Song(song));
            //因为从favoriteList和playHistory都是中本地缓存取出来的，所以需要Song类再包装一下
            this.insertSong(new Song(song));
            
        },
        random(){
            //获取随机播放歌曲列表
            //如果switchesCurrentIndex为0就把收藏列表作为随机播放列表
            //如果不为0就把播放历史列表中的歌曲作为随机播放列表
            let list = this.switchesCurrentIndex === 0 ? this.favoriteList : this.playHistory;

            //如果收藏列表和最近收听列表都为空时，点击随机播放按钮就不会有任何动作
            if(list.length === 0){
                return
            }

            //遍历这些歌曲数据，使用map方法用Song类来实例化
            list = list.map((song) => {
                return new Song(song);
            })

            //调用映射的方法传入歌曲列表
            this.randomPlay({
                list:list
            })
        },
        handlePlaylist(playlist){
            const bottom = playlist.length > 0 ? "60px" : "0";
            this.$refs.listWrapper.style.bottom = bottom;

            //先判断是否有这个元素，再计算高度，因为始终有1个列表是隐藏的（v-if未被渲染）
            this.$refs.favoriteList && this.$refs.favoriteList.refresh();
            this.$refs.playHistory && this.$refs.playHistory.refresh();
        },
        ...mapActions([
            'insertSong',  //映射添加歌曲到播放列表方法
            'randomPlay'    //映射随机播放方法
        ])
    },
    components:{
        Switches,
        Scroll,
        SongList,
        NoResult
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.user-center{
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 100;
    background-color: #222;
    &.slide-enter-active, &.slide-leave-active{
        transition: all 0.3s;
    }
    &.slide-enter, &.slide-leave-to{
        transform: translate3d(100%,0,0);
    }
    .back{
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .icon-back{
            display: block;
            padding: 10px;
            font-size: @iconfont-size-m;
            color: @theme-yellow;
        }
    }
    .switches-wrapper{
        margin: 10px 0 30px 0;
    }
    .play-btn{
        box-sizing: border-box;
        width: 150px;
        padding: 8px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid @text-color-lighter;
        color: @text-color-lighter;
        border-radius: 100px;
        font-size: 0;
        .icon-play{
            display: inline-block;
            vertical-align: middle;
            margin-right: 6px;
            font-size: 16px;
        }
        .text{
            display: inline-block;
            vertical-align: middle;
            font-size: @font-size-small;
        }
    }
    .list-wrapper{
        position: absolute;
        top: 120px;
        bottom: 0;
        width: 100%;
        .list-scroll{
            height: 100%;
            overflow: hidden;
            .list-inner{
                padding: 20px 30px;
            }
        }
    }
    .no-result-wrapper{
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
    }
}
</style>