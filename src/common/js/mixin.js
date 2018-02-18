//使用mixin可以使各个组件页面中共用这里面的代码

import {mapGetters} from 'vuex'; //引入vuex的getters

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
