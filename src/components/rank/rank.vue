<template>
    <div class="rank" ref="rank">
        <scroll :data="topList" class="toplist" ref="toplist">
            <ul>
                <li class="item" v-for="(item,index) in topList" :key="index" @click="selectItem(item)">
                    <div class="pic">
                        <img v-lazy="item.picUrl" />
                    </div>
                    <ul class="songlist">
                        <li class="song" v-for="(song,index) in item.songList" :key="index">
                            <span>{{index + 1}}</span>
                            <span>{{song.songname}}-{{song.singername}}</span>
                        </li>
                    </ul>
                </li>
            </ul>
        </scroll>
        <div class="loading-content" v-show="!topList.length">
            <loading></loading> 
        </div>
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
import { getTopList } from "@/api/rank";    //请求排行榜数据方法
import { ERR_OK } from "@/api/config";
import Scroll from "@/base/scroll/scroll";
import Loading from "@/base/loading/loading";
import {playlistMixin} from "@/common/js/mixin";
import {mapMutations} from "vuex";

export default {
    mixins:[playlistMixin],
    name: "rank",
    data() {
        return {
            topList:[]  //存放排行榜数据
        }
    },
    created(){
        this._getTopList()  
    },
    methods:{
        selectItem(item){
            this.$router.push({
                path:`/rank/${item.id}`
            })
            //把点击的排行榜数据提交给state.topList
            this.setTopList(item);
        },
        //解决当有歌曲播放时，页面底部位置。
        handlePlaylist(playlist){
            const bottom = playlist.length > 0 ? '60px' : '0';
            this.$refs.rank.style.bottom = bottom;
            this.$refs.toplist.refresh();
        },
        _getTopList(){
            getTopList().then((res) => {
                if(res.code === ERR_OK){
                    //console.log(res.data.topList);
                    //得到的数据赋值给空数组
                    this.topList = res.data.topList;
                }
            })
        },
        ...mapMutations({
            setTopList:"SET_TOP_LIST"   //从vuex映射方法
        })
    },
    components:{
        Scroll,
        Loading
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.rank {
    position: fixed;
    top: 88px;
    left: 0;
    bottom: 0;
    width: 100%;
    .toplist {
        overflow: hidden;
        height: 100%;
        .item {
            display: flex;
            padding-top: 20px;
            margin: 0 20px;
            &:last-child{
                padding-bottom: 20px;
            }
            .pic {
                flex: 0 0 100px;
                width: 100px;
                height: 100px;
                img {
                    width: 100px;
                    height: 100px;
                }
            }
            .songlist {
                padding: 0 15px;
                flex: 1;
                height: 100px;
                background: #333;
                overflow: hidden;   //多出的文字才会有省略号
                //是里面的行居中对齐
                display: flex;
                flex-direction: column;
                justify-content: center;
                .song {
                    font-size: @font-size-small;
                    color: @text-color-lighter;
                    line-height: 24px;
                    .text-overflow();   //省略文字：需要在父级加入overflow: hidden
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