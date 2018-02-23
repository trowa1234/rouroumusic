//使用mixin可以使各个组件页面中共用这里面的代码。注意曝露出去的mixin是对象

import {mapGetters, mapMutations, mapActions} from 'vuex'; //引入vuex的getters、mutations、actions
import {playMode} from '@/common/js/config'; //引入播放模式对象
import {shuffle} from "@/common/js/util";    //引入数组乱序方法

//解决播放器是最小化时，挡住各个页面最后1行的内容
//解决方法：在最小化播放器出现时，重新设置scroll组件bottom的高度
export const playlistMixin = {
    computed:{
        ...mapGetters(['playlist']) //通过vuex获取播放列表
    },
    mounted(){
        this.handlePlaylist(this.playlist);
    },
    //这个钩子函数是添加了<keep-alive>标签时(缓存页面)，进入这个页面才会触发activated钩子
    activated(){
        this.handlePlaylist(this.playlist);
    },
    watch:{
        playlist(newVal){
            this.handlePlaylist(newVal);
        }
    },
    methods:{
        handlePlaylist(){
            throw new Error('需要在组件的methods中编写handlePlaylist()方法')
        }
    }
}



//点击切换播放模式复用。这个功能在player组件和playlist中都会用到
export const playerMixin = {
    computed:{
        //播放模式样式处理
        iconMode(){
            return this.mode === playMode.sequence ? 'icon-listloop' : this.mode === playMode.loop ? "icon-singleloop" : "icon-random";
        },
        //计算属性中使用mapGetters
        ...mapGetters([
            "sequenceList",     //引入播放列表数据
            "currentSong",      //引入当前播放歌曲
            "playlist",         //引入播放歌曲列表
            "mode",              //引入当前播放模式
            "favoriteList"      //引入收藏歌曲列表
        ])
    },
    methods:{
        //点击事件，添加/删除收藏歌曲
        toggleFavorite(song){
            //如收藏列表有这首歌，点击就从列表中删除这首歌
            if(this.isFavorite(song)){
                this.deleteFavoriteList(song)
            } else{ //收藏列表没有这首歌，点击添加这首歌到收藏列表
                this.saveFavoriteList(song)
            }
        },
        //绑定收藏图标样式
        getFavoriteIcon(song){
            //如果收藏列表中有这首歌曲，添加样式favorited
            if(this.isFavorite(song)){
                return 'favorited'
            }
            //如果没有，不添加样式名
            return ''
        },
        //匹配收藏的列表中是否有当前歌曲
        isFavorite(song){
            const index = this.favoriteList.findIndex((item) => {
                return item.id === song.id
            })

            //如果有这首歌返回true，没有则返回false
            return index > -1
        },
        //点击切换播放模式
        changeMode(){
            //每次点击mode加1。
            //因为有3种播放模式，每种播放模式设置的值是:0,1,2。要让点击后的值始终在0,1,2之间循环
            //所以用模3。当mode为0时(0+1)%3=1；当mode为1时(1+1)%3=2；当mode为2时(2+1)%3=0。
            const mode = (this.mode + 1) % 3;
            //修改mode的方法
            this.setPlayMode(mode);

            let list = null; //用来存放歌曲列表数组
            //当是随机模式时
            if(mode === playMode.random){
                // 使用乱序方法对歌曲列表重新排序，并且保存到list中
                list = shuffle(this.sequenceList);
            }else{
                // 如果不是随机播放模式则直接保存列表
                list = this.sequenceList;
            }
            //切换模式歌曲不会切换
            this.resetCurrentIndex(list);
            //把播放列表设置为新的列表
            this.setPlaylist(list);
        },
        //切换播放模式时，当前播放的歌曲不会被切换
        resetCurrentIndex(list){
            //使用ES6中的findIndex()方法，在新得到的数组中去匹配当前播放歌曲的id，找到了就返回新数组中首歌曲的索引值
            let index = list.findIndex((item) => {
                return item.id === this.currentSong.id
            })
            //把这个索引值设置给当前所索引值，歌曲就不会被切换
            this.setCurrentIndex(index)
        },
        ...mapMutations({
            setPlayingState: "SET_PLAYING_STATE", //映射设置playing方法
            setCurrentIndex:"SET_CURRENT_INDEX",//映射设置currentIndex方法
            setPlayMode:"SET_PLAY_MODE", //映射设置mode方法
            setPlaylist:"SET_PLAYLIST" //映射设置播放列表playlist方法
        }),
        ...mapActions([
            "saveFavoriteList",     //映射添加歌曲到收藏列表
            "deleteFavoriteList"    //删除收藏歌曲
        ])
    }
}


//搜索功能、保存搜索历史记录复用。这个功能search组件和add-song组件都会用到
export const searchMixin = {
    data() {
        return {
            query:'',    //接收search-box传递处理的搜索字符
            refreshDelay:200    //scroll组件重新计算高度延迟时间
        }
    },
    computed: {
        ...mapGetters([
            "searchHistory" //从vuex中的getters中拿到searchHistory
        ])
    },
    methods:{
        //点击关键词，把关键词添加到搜索栏
        addQuery(query) {
            this.$refs.searchBox.setQuery(query);
        },
        //接收searchbox派发的query事件，并且把里面传递出来的新query值赋值给query
        onQueryChange(query) {
            this.query = query;
        },
        //监听滚动开始事件listScroll
        blurInput() {
            //调用searchBox中的blur()，使输入框失去焦点
            this.$refs.searchBox.blur();
        },
        //调用了vuex的actions中的方法，那当前搜索的字符提交给state，并且缓存在了本地localStorage中
        saveSearch() {
            this.saveSearchHistory(this.query);
        },
        ...mapActions([
            "saveSearchHistory", //映射vuex的actions中的添加方法
            "deleteSearchHistory" //删除方法
        ])
    }
}
