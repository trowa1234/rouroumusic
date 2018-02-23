//state拿到数据后通常会在getters中做映射，做一个简单的包装，组件就从这个getters中取数据

//把state.singer曝露出去。歌手信息
export const singer = state => state.singer     //跟下面语句效果一样，箭头函数更简洁
// export const singer = function(state){return state.singer}


//播放器
export const playing = state => state.playing
export const fullScreen = state => state.fullScreen
export const playlist = state => state.playlist
export const sequenceList = state => state.sequenceList
export const mode = state => state.mode
export const currentIndex = state => state.currentIndex
//getters中也可以计算属性
//当前播放歌曲就是用playlist和currentIndex计算后得到的
export const currentSong = (state) => {
    return state.playlist[state.currentIndex] || {}
}


//把state.disc曝露出去。歌单信息
export const disc = state => state.disc

//把state.topList曝露出去。排行榜信息
export const topList = state => state.topList

//曝露搜索历史
export const searchHistory = state => state.searchHistory

//曝露播放历史
export const playHistory = state => state.playHistory