//actions是用于异步操作和封装mutations中的方法（当需要用到mutations中的多个方法就需要封装）

import * as types from './mutation-types' //引入方法名
import { playMode } from '@/common/js/config' //播放模式配置文件
import { shuffle } from '@/common/js/util' //数组乱序方法

//1、把字符存入本地缓存的方法。2、删除指定数据方法。3、删除所有数据方法
import { saveSearch, deleteSearch, clearSearch, savePlay } from "@/common/js/cache"

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


//歌手页面随机播放全部歌曲方法。   
//接收的参数是以对象的形式的{list}，因为那边传参是用的对象方式，所以vuex的actions中也要以对象形式接收参数
export const randomPlay = function ({ commit, state }, { list }) {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomlist = shuffle(list)  //乱序歌曲列表
    commit(types.SET_PLAYLIST, randomlist)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}


//实现点击搜索列表中歌曲，添加这首歌曲到当前播放列表
//要修改多个state，所以需要在actions中封装mutations的方法
export const insertSong = function ({ commit, state }, song) {

    //使用了slice()方法返回1个新的数组，因为下面会操作这个state.playlist。
    //但是操作vuex的state只能用mutations中的方法，会报错。
    //所以这里需要复制1个数组副本来进行操作，最后再通过mutations的方法修改state.playlist
    let playlist = state.playlist.slice();

    let sequenceList = state.sequenceList.slice();//同上

    let currentIndex = state.currentIndex;//state.currentIndex因为是基础值类型，不会被修改，只是复制给了currentIndex

    //记录当前歌曲
    let currentSong = playlist[currentIndex];
    //查找当前列表中是否有待插入的歌曲并返回其索引值
    let fpIndex = findIndex(playlist, song);//用上面定义的findIndex，在歌曲类别中查找这首歌曲的索引值
    //因为是插入歌曲，所以索引值+1
    currentIndex++;
    //插入这首歌到当前索引位置
    playlist.splice(currentIndex, 0, song);

    //如果这首歌已经在列表中
    if (fpIndex > -1) {
        //如果当前插入索引大于原本就在歌曲列表中歌曲的索引
        if (currentIndex > fpIndex) {
            //就删掉原本在歌曲列表中的歌曲
            playlist.splice(fpIndex, 1);
            //删除掉歌曲，歌曲列表length会少1个，所以currentIndex也要减1
            currentIndex--
        } else {//如果当前插入索引小于等于原本就在歌曲列表中歌曲的索引。插入在这个索引之前
            //因为插入到索引的前面，原本的索引值就+1。删除原本在歌曲列表中的歌曲
            playlist.splice(fpIndex + 1, 1);
        }
    }

    //获取当前sequenceList插入的索引
    let currentSIndex = findIndex(sequenceList, currentSong) + 1;

    //修改sequenceList的逻辑和上面的playlist是一样的
    let fsIndex = findIndex(sequenceList, song);
    sequenceList.splice(currentSIndex, 0, song);
    if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1);
        } else {
            sequenceList.splice(fsIndex + 1, 1);
        }
    }

    //使用mutations中的方法提交数据
    commit(types.SET_PLAYLIST, playlist);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
}


//把搜索的字符提交给stae.searchHistory，并且使用saveSearch方法保存到缓存中
export const saveSearchHistory = function ({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

//删除缓存，并提交新的缓存数组
export const deleteSearchHistory = function ({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

//删除所有缓存，并提交空数组
export const clearSearchHistory = function ({ commit }) {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
}

//删除歌曲列表中指定（点击）的歌曲
export const deleteSong = function ({ commit, state }, song) {
    let playlist = state.playlist.slice();
    let sequenceList = state.sequenceList.slice();
    let currentIndex = state.currentIndex;

    //在当前播放列表中查找传入歌曲相同的歌曲，并返回该歌曲在歌曲列表中的索引值
    let pIndex = findIndex(playlist, song);
    //根据这个索引值删除列表中的歌曲
    playlist.splice(pIndex, 1);

    //跟上面一样，只是在sequenceList这个列表中操作删除歌曲
    let sIndex = findIndex(sequenceList, song);
    sequenceList.splice(sIndex, 1);

    //当删除的歌曲在当前播放歌曲前面时，或者当前播放歌曲是最后1首歌曲时
    if (currentIndex > pIndex || currentIndex === playlist.length) {
        currentIndex--;//因为前面的删除了1项，所以当前播放歌曲的索引值需要-1.否则会切换歌曲
    }

    //使用mutations中的方法提交数据
    commit(types.SET_PLAYLIST, playlist);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);

    //如果删掉的是歌曲列表的最后1首歌曲
    if (!playlist.length) {
        commit(types.SET_PLAYING_STATE, false); //把播放状态切换为关闭
    } else {
        commit(types.SET_PLAYING_STATE, true);//否则就是开启状态
    }
}


//清空歌曲列表。把所有状态设置为默认值
export const deleteSongList = function ({ commit }) {
    commit(types.SET_PLAYLIST, []); //设置为空数组
    commit(types.SET_SEQUENCE_LIST, []); //设置为空数组
    commit(types.SET_CURRENT_INDEX, -1); //当前歌曲索引 -1
    commit(types.SET_PLAYING_STATE, false) //关闭播放状态
}

//保存当前播放歌曲到state.playHistory。还保存到本地缓存中
export const savePlayHistory = function ({ commit }, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}