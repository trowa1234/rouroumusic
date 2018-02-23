//所有的方法都在这里定义

//引入types文件。是用了import语法*,接下拉就可以在下面这样调用方面的名字 [types.SET_SINGER]
import * as types from "./mutation-types"

const mutations = {
    //定义SET_SINGER()方法，第1个参数就是state文件中那个状态对象，第2个参数就是传递的数据
    //此方法的作用是：接收参数(歌手数据)，提交给state.singer
    [types.SET_SINGER](state, singer) {
        //提交状态操作，把获取的歌手数据提交到state状态对象的singer中保存
        state.singer = singer
    },
    
    //播放器方法
    [types.SET_PLAYING_STATE](state, flag) {
        state.playing = flag
    },
    [types.SET_FULL_SCREEN](state, flag) {
        state.fullScreen = flag
    },
    [types.SET_PLAYLIST](state, list) {
        state.playlist = list
    },
    [types.SET_SEQUENCE_LIST](state, list) {
        state.sequenceList = list
    },
    [types.SET_PLAY_MODE](state, mode) {
        state.mode = mode
    },
    [types.SET_CURRENT_INDEX](state, index) {
        state.currentIndex = index
    },

    //接收参数(歌单数据)，提交给state.disc
    [types.SET_DISC](state,disc){
        state.disc = disc
    },

    //接收参数(排行榜数据)，提交给state.topList
    [types.SET_TOP_LIST](state,topList){
        state.topList = topList
    },

    //接收参数（搜索历史数据），提交给state.searchHistory
    [types.SET_SEARCH_HISTORY](state,history){
        state.searchHistory = history
    },

    //接收参数（播放历史数据），提交给state.playHistory
    [types.SET_PLAY_HISTORY](state,playHistory){
        state.playHistory = playHistory
    },

    //接收参数（收藏列表），提交给state.favoriteList
    [types.SET_FAVORITE_LIST](state,list){
        state.favoriteList = list
    }
}

//把mutations曝露出去
export default mutations