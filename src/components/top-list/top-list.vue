<template>
    <!-- 使用transition标签实现页面跳转动画 -->
    <transition name="slide">
        <!-- 传入歌单名、歌单图片、歌曲数据 -->
        <music-list :title="title" :bg-image="bgImage" :songs="songs" :rank="rank"></music-list>
    </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from "@/components/music-list/music-list";
import {mapGetters} from "vuex";
import {getMusicList} from "@/api/rank";
import {ERR_OK} from "@/api/config";
import {createSong} from "@/common/js/song" //创建歌曲类

export default {
    name: "top-list",
    data(){
        return{
            songs:[],  //接收处理后歌曲数据
            rank:true   //传入配置参数显示排名
        }
    },
    computed:{
        //根据数据获取排行榜歌单标题
        title(){
            return this.topList.topTitle
        },
        //根据数据获取排行榜歌单图片
        bgImage(){
            //设置歌单图片为第一首个的图片
            if(this.songs.length){
                return this.songs[0].image
            }

            //否则就使用歌单本身的图片
            return this.topList.picUrl
        },
        ...mapGetters([
            'topList'   //接收vuex中的topList数据
        ])
    },
    created(){
        this._getMusicList();
    },
    methods:{
        _getMusicList(){
            if(!this.topList.id){
                this.$router.push({
                    path:'/rank'
                })
                return
            }
            getMusicList(this.topList.id).then((res) => {
                this.songs = this._handleSongs(res.songlist) //处理歌曲数据后赋值给songs
                //console.log(this.songs)
            })
        },
        //这个方法主要的作用是把歌曲数据转换成我们期望的数据格式
        _handleSongs(list){
            let ret = []
            //遍历歌曲列表
            list.forEach((item) => {
                //对象中的data就是我们需要的数据
                const musicData = item.data;
                //做边界处理。当有歌曲id和专辑id时
                if(musicData.songid && musicData.albummid){
                    // 就把歌曲添加进数组中，并且传入数据构造成我们期望的歌曲数据格式
                    ret.push(createSong(musicData))
                }
            })
            return ret
        }
    },
    components:{
        MusicList
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
//页面切换动画样式
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}
.slide-enter,
.slide-leave-to {
    transform: translate3d(100%, 0, 0);
}
</style>