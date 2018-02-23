<template>
    <transition name="list-fade">
        <!-- 点击蒙层也隐藏 -->
        <div class="playlist" v-show="showFlag" @click="hide">
            <!-- 这里防止点击事件冒泡,没有实际的点击事件 -->
            <div class="list-wrapper" @click.stop>
                <div class="list-header">
                    <h1 class="title">
                        <!-- 绑定播放模式样式，和点击切换播放模式事件，用的是供代码playerMixin -->
                        <i class="icon iconfont" :class="iconMode" @click="changeMode"></i>
                        <span class="text">{{modeText}}</span>
                        <!-- 清空歌曲列表事件，先弹对话框 -->
                        <span class="clear" @click="showConfirm">
                            <i class="iconfont icon-empty"></i>
                        </span>
                    </h1>
                </div>
                <!-- 歌曲列表使用滚动组件 -->
                <!-- 延迟200毫秒计算高度是因为组件中使用了动画组，需要在动画执行完成后才计算高度 -->
                <scroll :data="sequenceList" :refreshDelay="refreshDelay" class="list-content" ref="listContent">
                    <!-- 使用动画组，在删除歌曲是添加动画效果。tag=ul就是把transition-group标签渲染成ul -->
                    <transition-group name="list" tag="ul">
                        <!-- 渲染播放列表数据。绑定点击事件，点击列表中的歌曲可以播放 -->
                        <!-- 注意由于使用了动画组，所以必须绑定key值，且key不能为index值，它会重新渲染dom是动画无效 -->
                        <li class="item" v-for="(item,index) in sequenceList" :key="item.id" @click="selectItem(item,index)" ref="listItem">
                            <!-- 正在播放歌曲绑定样式 -->
                            <i class="current" :class="getCurrentIcon(item)"></i>
                            <span class="text">{{item.name}}</span>
                            <!-- 点击事件，收藏歌曲，方法定义在playerMixin中 -->
                            <span class="like" @click.stop="toggleFavorite(item)">
                                <i class="iconfont icon-favorite" :class="getFavoriteIcon(item)"></i>
                            </span>
                            <!-- 绑定事件：删除指定歌曲 -->
                            <span class="delete" @click.stop="deleteOne(item)">
                                <i class="iconfont icon-delete"></i>
                            </span> 
                        </li>
                    </transition-group>
                </scroll>
                <div class="list-operate">
                    <!-- 点击显示添加歌曲组件 -->
                    <div class="add" @click="addSong">
                        <i class="iconfont icon-add"></i>
                        <span class="text">添加歌曲到队列</span>
                    </div>
                </div>
                <div class="list-close" @click="hide">
                    <span>关闭</span>
                </div> 
            </div>
            <!-- 对话框，绑定确定按钮事件清空歌曲列表 -->
            <confirm @confirm="clear" ref="confirm" text="是否清空播放列表？" confirmBtnText="清空"></confirm>
            <add-song ref="addSong"></add-song>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
import {mapActions} from "vuex";    //引入vuex的 getters、mutations、actions
import Scroll from "@/base/scroll/scroll";
import {playMode} from "@/common/js/config"; //播放模式配置
import Confirm from "@/base/confirm/confirm";
import {playerMixin} from "@/common/js/mixin"; //引入播放模式切换公共代码
import AddSong from "@/components/add-song/add-song";

export default {
    mixins:[playerMixin],
    name: "playlist",
    data() {
        return {
            showFlag: false,
            refreshDelay:200    //scroll组件重新计算高度延迟时间
        };
    },
    computed:{
        modeText(){
            return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.loop ? "单曲循环" : "随机播放";
        }
    },
    methods:{
        //点击列表中的歌曲可以播放
        selectItem(item,index){
            console.log(item)
            //如果是随机模式，索引值需要去歌曲列表中匹配
            if(this.mode === playMode.random){
                //在歌曲列表中使用findIndex方法匹配其中的歌曲
                index = this.playlist.findIndex((song) => {
                    //如果列表中的歌曲id等于点击的歌曲id，就得到这首歌曲在playlist中的索引值
                    return song.id === item.id;
                })
            }

            //设置索引为当前点击的index。在随机模式下设置索引为查找后得到index
            this.setCurrentIndex(index);
            //同时设置播放状态为开启
            this.setPlayingState(true);
        },
        //删除指定歌曲
        deleteOne(item){
            this.deleteSong(item);
            //如果播放列表没有数据了
            if(!this.playlist.length){
                this.hide(); //隐藏歌曲列表
            }
        },
        //给当前播放歌曲添加样式
        getCurrentIcon(item){
            //如果当前播放歌曲的id和列表中歌曲的id相同
            if(this.currentSong.id === item.id){
                //就添加这个两个样式
                return "iconfont icon-play";
            }
        },
        //点击弹窗对话框
        showConfirm(){
             this.$refs.confirm.show(); //显示对话框
        },
        //对话框确定按钮事件，清空歌曲列表
        clear(){
            this.deleteSongList();  //调用清除歌曲列表方法
            this.hide();//调用隐藏歌曲列表方法
        },
        //点击显示add-song组件
        addSong(){
            this.$refs.addSong.show(); //调用了add-song组件提供的方法
        },
        //显示方法
        show(){
            this.showFlag = true;

            //dom在隐藏时无法计算高度，所以在显示时重新计算滚动列表的高度。同时列表跳转至当前播放歌曲的位置
            //注意需要延迟执行否则也无法计算
            setTimeout(() => {
                this.$refs.listContent.refresh();//计算列表高度
                this._scrollToCurrent(this.currentSong);//列表跳转至当前播放歌曲位置的方法
            },20);
        },
        //隐藏方法
        hide(){
            this.showFlag = false;
        },
        //封装方法：滚动列表使当前播放的歌曲始终排在第一排
        _scrollToCurrent(current){
            //在播放列表中查找当前播放的歌曲，返回索引值index
            const index = this.sequenceList.findIndex((song) => {
                return current.id === song.id
            })
            //使用组件提供的方法跳转到当前歌曲对应的项
            this.$refs.listContent.scrollToElement(this.$refs.listItem[index],300)
        },
        ...mapActions([
            'deleteSong',    //映射actions中的方法。删除1首歌曲
            'deleteSongList' //删除所有歌曲
        ])
    },
    components:{
        Scroll,
        Confirm,
        AddSong
    },
    watch:{
        //监听当前歌曲，当前歌曲发生变化时就调用列表跳转到相对应歌曲
        currentSong(newSong,oldSong){
            //如果歌曲列表处于隐藏，或者当前歌曲是同一首的话，什么都不做
            if(!this.showFlag || newSong.id === oldSong.id){
                return
            }
            
            this._scrollToCurrent(newSong);
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.playlist{
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 350;
    background-color: rgba(0, 0, 0, 0.3);
    &.list-fade-enter-active, &.list-fade-leave-active{
        transition: opacity 0.3s;
        .list-wrapper{
            transition: all 0.3s;
        }
    }
    &.list-fade-enter, &.list-fade-leave-to{
        opacity: 0;
        .list-wrapper{
            transform: translate3d(0,100%,0);
        }
    }
    .list-wrapper{
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        background-color: @body-bg-blacker;
        .list-header{
            position: relative;
            padding: 20px 30px 10px 20px;
            .title{
                display: flex;
                align-items: center;
            }
            .icon{
                margin-right: 10px;
                font-size: @iconfont-size-m;
                color: @theme-yellow;
            }
            .text{
                flex: 1;
                font-size: @font-size-medium;
                color: @text-color-white;
            }
            .clear{
                .extend-click();
                .icon-empty{
                    font-size: 18px;
                    color: @text-color-lighter;
                }
            }
        }
        .list-content{
            max-height: 240px; //歌曲列表定义了最大高度，要使用srcoll组件实现滚动
            overflow: hidden;
            .item{
                display: flex;
                align-items: center;
                height: 40px;
                padding: 0 30px 0 20px;
                overflow: hidden;
                &.list-enter-active, &.list-leave-active{
                    transition: all 0.2s linear;
                }
                &.list-enter, &.list-leave-to{
                    transform: translate3d(-100%,0,0);
                    height: 0;
                }
                .current{
                    flex: 0 0 20px;
                    width: 20px;
                    font-size: @font-size-medium;
                    color: @theme-yellow;
                }
                .text{
                    flex: 1;
                    .text-overflow();
                    font-size: @font-size-medium;
                    color: @text-color-white;
                }
                .like{
                    .extend-click();
                    .icon-favorite{
                        font-size: 16px;
                        color: @theme-yellow;
                        margin-right: 15px;
                        &.favorited{
                        color: @brand-danger;
                        }
                    }
                }
                .delete{
                    .extend-click();
                    .icon-delete{
                        font-size: 18px;
                        color: @theme-yellow;
                    }
                    
                }
            }
        }
        .list-operate{
            width: 150px;
            margin: 20px auto 30px auto;
            .add{
                display: flex;
                align-items: center;
                padding: 8px 16px;
                border-radius: 100px;
                border: 1px solid @text-color-lighter;
                color: @text-color-lighter;
                .icon-add{
                    margin-right: 5px;
                    font-size: @iconfont-size-s;
                }
                .text{
                    font-size: @font-size-small;
                }
            }
        }
        .list-close{
            text-align: center;
            line-height: 50px;
            background-color: #222;
            font-size: @font-size-medium-x;
            color: @text-color-lighter;
        }
    }
}
</style>