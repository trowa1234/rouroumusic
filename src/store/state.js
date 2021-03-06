import { playMode } from '@/common/js/config'   //为了语义化代码，定义playMode播放模式
import { loadSearch, loadPlay, loadFavorite} from "@/common/js/cache"  //获取本地缓存方法

//所有的状态由state来管理
const state = {
    singer: {},   //定义存放歌手数据的对象

    //以下是配置播放器所需要的基础数据。很多地方都可以直接打开播放器，所以控制这个播放器的数据是全局的
    playing: false,  //播放和暂停控制
    fullScreen: false,   //全屏和最小化控制
    playlist: [],    //播放列表数组
    sequenceList: [],    //顺序播放列表数组
    mode: playMode.sequence, //播放模式控制
    currentIndex: -1, //当前播放音乐的索引

    disc:{}, //定义存放歌单数据的对象
    topList:{},  //定义存放排行榜数据的对象
    searchHistory:loadSearch(),    //定义搜索历史列表，取的本地缓存
    playHistory:loadPlay(),      //歌曲播放历史列表，取的本地缓存
    favoriteList:loadFavorite()     //收藏歌曲列表，取的本地缓存
}

//把state曝露出去
export default state 