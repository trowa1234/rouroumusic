<template>
    <!-- 使用transition标签实现页面跳转动画 -->
    <transition name="slide">
        <!-- 传入歌手名、歌手头像、歌曲数据 -->
        <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
    </transition>
</template>

<script type="text/ecmascript-6">
//vuex提供的语法糖.这里引入的是mapGetters，所以就要在computed计算中添加
import {mapGetters} from 'vuex'
import {getSingerDetail} from '@/api/singer'    //调用获取歌手详情数据的方法
import {ERR_OK} from '@/api/config'
import{createSong} from '@/common/js/song'  //引入歌曲工厂函数
import MusicList from '@/components/music-list/music-list'

export default {
    name: "singer-detail",
    data(){
        return{
            songs:[],    //定义数组来存放所有歌曲对象
        }
    },
    computed:{
        //在计算属性中获取歌手名字，向组件中传入
        title(){
            return this.singer.name
        },
        //同上，歌手头像，向组件中传入
        bgImage(){
            return this.singer.avatar
        },
        //getters对应的就是计算属性computed，需要注意的是mapGetters()中是数组
        ...mapGetters([
            //在这里引入singer，注意是字符串形式，这个singer就是getters中通过映射state.singer曝露出来的
            'singer'
        ])
    },
    created(){
        //通过上面的操作在本页面直接使用this.singer就可以获取到state中singer的数据
        //console.log(this.singer);
        this._getDetail()   //调用获取歌手详情数据方法
    },
    methods:{
        //获取歌手详情数据方法
        _getDetail(){
            //判断本页面是否获取到歌手的id
            if(!this.singer.id){
                //没有的话就直接跳转页面到歌手列表页
                this.$router.push('/singer')
                return
            }
            //调用方法传入歌手的id发送请求获得数据。所以必须要本页面有歌手的id请求才能获取数据
            getSingerDetail(this.singer.id).then((res) => {
                if(res.code === ERR_OK){
                    //console.log(res.data.list)  //打印获取的数据

                    //处理歌曲数据格式并且把它放入songs数组中
                    this.songs = this._handleSongs(res.data.list)
                    //console.log(this.songs)
                }
            })
        },
        //这个方法主要的作用是把歌曲数据转换成我们期望的数据格式
        _handleSongs(list){
            let ret = []
            //遍历歌曲列表
            list.forEach((item) => {
                //这里我们需要是数据都在musicData中，所以把musicData保存出来
                let musicData = item.musicData

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
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s;
}
.slide-enter,
.slide-leave-to {
    transform: translate3d(100%, 0, 0);
}
</style>