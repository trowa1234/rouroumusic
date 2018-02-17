//actions是用于异步操作和封装mutations中的方法（当需要用到mutations中的多个方法就需要封装）

import * as types from './mutation-types' //引入方法名
import { playMode } from '@/common/js/config' //播放模式配置文件
import { shuffle } from '@/common/js/util' //数组乱序方法

//使用ES6中的findIndex()方法，随机数组中去匹配当前播放歌曲的id，找到了就返回新数组中首歌曲的索引值
function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}


//点击歌曲后事件函数。有两个对象参数，第1个对象参数是commit(用于调用方法)和state(用于获取状态)；第2个对象参数是list(歌曲列表)和index(当前歌曲索引)，这两个参数都是传递过来的
export const selectPlay = function ({ commit, state }, { list, index }) {
    //通过commit调用mutations中的SET_SEQUENCE_LIST()方法，把歌曲列表提交保存到state.sequenceList中去
    commit(types.SET_SEQUENCE_LIST, list)   //获取顺序列表数据 

    if (state.mode === playMode.random) {//如果播放模式为随机播放
        let randomlist = shuffle(list) //打乱歌曲列表
        commit(types.SET_PLAYLIST, randomlist) //设置歌曲列表为乱序后的列表
        index = findIndex(randomlist, list[index])   //找到当前播放歌曲的索引值
    } else {
        commit(types.SET_PLAYLIST, list)  //获取播放列表数据
    }

    commit(types.SET_CURRENT_INDEX, index)  //获取当前歌曲索引值
    commit(types.SET_FULL_SCREEN, true)     //设置全屏状态为true
    commit(types.SET_PLAYING_STATE, true)   //设置播放状态为true
}


//歌手页面随机播放全部歌曲方法
export const randomPlay = function ({ commit, state }, { list }) {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomlist = shuffle(list)  //乱序歌曲列表
    commit(types.SET_PLAYLIST, randomlist)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}