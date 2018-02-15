//actions是用于异步操作和封装mutations中的方法（当需要用到mutations中的多个方法就需要封装）

import * as types from './mutation-types' //引入方法名

//点击歌曲后事件函数。有两个对象参数，第1个对象参数是commit(用于调用方法)和state(用于获取状态)；第2个对象参数是list(歌曲列表)和index(当前歌曲索引)，这两个参数都是传递过来的
export const selectPlay = function({commit,state},{list,index}){
    //通过commit调用mutations中的SET_SEQUENCE_LIST()方法，把歌曲列表提交保存到state.sequenceList中去
    commit(types.SET_SEQUENCE_LIST, list)   //获取顺序列表数据 
    commit(types.SET_PLAYLIST, list)        //获取播放列表数据
    commit(types.SET_CURRENT_INDEX, index)  //获取当前歌曲索引值
    commit(types.SET_FULL_SCREEN, true)     //设置全屏状态为true
    commit(types.SET_PLAYING_STATE, true)   //设置播放状态为true
}