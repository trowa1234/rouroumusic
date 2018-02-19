<template>
    <!-- 使用transition标签实现页面跳转动画 -->
    <transition name="slide">
        <!-- 传入歌单名、歌单图片、歌曲数据 -->
        <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
    </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from "@/components/music-list/music-list"
import {mapGetters} from "vuex" //引入vuex获取歌单数据
import {getSongList} from "@/api/recommend" //请求歌单歌曲方法
import {ERR_OK} from "@/api/config"
import {createSong} from "@/common/js/song" //创建歌曲类

export default {
    name: "disc",
    data(){
        return {
            songs:[]
        }
    },
    computed:{
        // 获取歌单标题
        title(){
            return this.disc.dissname
        },
        // 获取歌单图片
        bgImage(){
            return this.disc.imgurl
        },
        ...mapGetters([
            'disc'  //获取歌单数据
        ])
    },
    created(){
        //在created钩子时请求数据
        this._getSongList();
    },
    methods:{
        //请求歌单数据
        _getSongList(){
            //在此页面刷新页面会拿不到数据，这里需要做一下处理
            if(!this.disc.dissid){
                this.$router.push('/recommend');
                return
            }
            //请求歌单歌曲数据
            getSongList(this.disc.dissid).then((res) => {
                console.log(res)
                if(res.code === ERR_OK){
                    console.log(res.cdlist[0].songlist);
                    this.songs = this._handleSongs(res.cdlist[0].songlist)
                }
            })
        },
        //这个方法主要的作用是把歌曲数据转换成我们期望的数据格式
        _handleSongs(list){
            let ret = []
            //遍历歌曲列表
            list.forEach((musicData) => {
                //做边界处理。当有歌曲id和专辑id时
                if(musicData.songid && musicData.albummid){
                    // 就把歌曲添加进数组中，并且传入数据构造成我们期望的歌曲数据格式
                    ret.push(createSong(musicData))
                }
            })
            return ret
        }
    },
    components: {
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