<template>
    <!-- vuex中的播放列表不为空显示播放器 -->
    <div class="player" v-show="playlist.length>0">
        <!-- 切换到播放器时有动画效果，直接用transition标签，然后在css样式中编写 -->
        <!-- 还需要做cd飞出的效果，这样的效果就只有用动画函数钩子 -->
        <transition name="normal" 
                    @enter="enter" 
                    @after-enter="afterEnter" 
                    @leave="leave" 
                    @after-leave="afterLeave">  <!--4个函数钩子，绑定这些钩子，在methods中操作它们 -->

            <!-- 全屏状态。由fullScreen控制 -->
            <div class="normal-player" v-show="fullScreen">
                <div class="bg">
                    <!-- 从getters获取的当前歌曲的对象，取image属性 -->
                    <img :src="currentSong.image" />
                </div>
                <div class="top">
                    <!-- 绑定点击事件，播放器最小化 -->
                    <div class="back" @click="back">
                        <i class="iconfont icon-down"></i>
                    </div>
                    <h1 class="song-tit" v-html="currentSong.name"></h1>
                    <h2 class="singer-tit" v-html="currentSong.singer"></h2>
                </div>
                <div class="middle">
                    <div class="middle-l">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd">
                                <img :src="currentSong.image" class="image">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <div class="operators">
                        <div class="icon">
                            <i class="iconfont icon-listloop"></i>
                        </div>
                        <div class="icon">
                            <i class="iconfont icon-prve"></i>
                        </div>
                        <div class="icon">
                            <i class="iconfont icon-play"></i>
                        </div>
                        <div class="icon">
                            <i class="iconfont icon-next"></i>
                        </div>
                        <div class="icon">
                            <i class="iconfont icon-favorite"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <transition name="mini">
            <!-- 最小化状态。由fullScreen控制 -->
            <!-- 绑定点击事件，播放器最大化 -->
            <div class="mini-player" v-show="!fullScreen" @click="open">
                <div class="pic">
                    <img :src="currentSong.image" />
                </div>
                <div class="text">
                    <h3 class="song-name" v-html="currentSong.name"></h3>
                    <h4 class="singer-name" v-html="currentSong.singer"></h4>
                </div>
                <div class="control">
                    <i class="iconfont icon-pause"></i>
                </div>
                <div class="control">
                    <i class="iconfont icon-songlist"></i>
                </div>
            </div>
        </transition>
    </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations } from "vuex"; //使用vuex的getters,mutations
import animations from 'create-keyframe-animation';  //在js中使用css3动画，这里就需要一个第三方的插件库create-keyframe-animation
import {prefixStyle} from '@/common/js/dom'; //自动添加浏览器厂商CSS前缀方法

const transform = prefixStyle('transform'); 

export default {
    name: "player",
    computed: {
        //计算属性中使用mapGetters
        ...mapGetters(["playlist", "fullScreen", "currentSong"])
    },
    methods: {
        //播放器最小化
        back() {
            this.setFullScreen(false);
        },
        //播放器全屏
        open() {
            this.setFullScreen(true);
        },

        //动画钩子函数Start
        enter(el,done){
            const {x,y,scale} = this._getPosAndScale(); //获取目标坐标和缩放
            //使用第三方插件在js中是用css3动画
            let animation = {
                0:{
                    transform:`translate3d(${x}px,${y}px,0) scale(${scale})`
                },
                60:{
                    transform:`translate3d(0,0,0) scale(1.1)`
                },
                100:{
                    transform:`translate3d(0,0,0) scale(1)`
                }
            }
            animations.registerAnimation({
                name:'move',
                animation,
                presets:{
                    duration:400,
                    easing:'linear'
                }
            })
            animations.runAnimation(this.$refs.cdWrapper,'move',done)
        },
        afterEnter(){
            animations.unregisterAnimation('move');
            this.$refs.cdWrapper.style.animation = '';
        },
        leave(el,done){
            this.$refs.cdWrapper.style.transition = 'all 0.4s';
            const {x,y,scale} = this._getPosAndScale();
            this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
            this.$refs.cdWrapper.addEventListener('transitionend',done);
        },
        afterLeave(){
            this.$refs.cdWrapper.style.transition = '';
            this.$refs.cdWrapper.style[transform] = '';
        },
        //动画钩子函数End

        //获取中间大cd图片到小播放器中的cd图片的位置坐标和缩放比例的方法
        _getPosAndScale(){
            const targetWidth = 40; //小cd图片宽度
            const paddingLeft = 40; //小cd图片左边距，左边到圆心
            const paddingBottom = 30;//小cd图片下边距，下边到圆心

            const paddingTop = 80;//大cd图片距顶部的高度，从边算
            const width = window.innerWidth * 0.8;  //大cd图片的宽度,css设置的80%
            const scale = targetWidth / width;  //所以可以得到缩放比例为小cd宽度除以大cd宽度
            const x = -(window.innerWidth / 2 - paddingLeft);//小cd图片圆心x轴坐标
            const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;//小cd图片圆心y轴坐标
            return{
                x,y,scale
            }
        },
        ...mapMutations({
            setFullScreen: "SET_FULL_SCREEN"
        })
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.player {
    .normal-player {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 200;
        background: #222;

        //normal切换动画
        &.normal-enter-active,
        &.normal-leave-active {
            transition: all 0.4s;
            .top,
            .bottom {
                transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
            }
        }
        &.normal-enter,
        &.normal-leave-to {
            opacity: 0;
            .top {
                transform: translate3d(0, -100px, 0);
            }
            .bottom {
                transform: translate3d(0, 100px, 0);
            }
        }
        .bg {
            position: absolute;
            top: 0;
            left: 0;
            z-index: -1;
            width: 100%;
            height: 100%;
            filter: blur(30px);
            opacity: 0.6;
            img {
                width: 100%;
                height: 100%;
            }
        }
        .top {
            position: relative;
            padding-top: 10px;
            .back {
                position: absolute;
                left: 12px;
                top: 6px;
                .icon-down {
                    font-size: @iconfont-size-m;
                    color: @theme-yellow;
                }
            }
            .song-tit {
                text-align: center;
                font-size: @font-size-large;
            }
            .singer-tit {
                text-align: center;
                font-size: @font-size-medium;
                margin-top: 10px;
            }
        }
        .middle {
            position: fixed;
            width: 100%;
            top: 80px;
            bottom: 170px;
            white-space: nowrap;
            font-size: 0;
            .middle-l {
                display: inline-block;
                vertical-align: top;
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 80%;
                .cd-wrapper {
                    position: absolute;
                    left: 10%;
                    top: 0;
                    width: 80%;
                    height: 100%;
                    .cd {
                        width: 100%;
                        height: 100%;
                        box-sizing: border-box;
                        border: 10px solid rgba(255, 255, 255, 0.1);
                        border-radius: 50%;
                        .image {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                        }
                    }
                }
            }
        }
        .bottom {
            position: fixed;
            bottom: 50px;
            left: 0;
            width: 100%;
            .operators {
                display: flex;
                width: 90%;
                margin: 0 auto;
                align-items: center;
                .icon {
                    flex: 1;
                    text-align: center;
                    .iconfont {
                        font-size: @iconfont-size-l;
                        color: @theme-yellow;
                    }
                    .icon-play {
                        font-size: 50px;
                    }
                }
            }
        }
    }
    .mini-player {
        position: fixed;
        left: 0;
        bottom: 0;
        height: 60px;
        width: 100%;
        z-index: 300;
        background: #323232;
        display: flex;
        align-items: center;

        //mini切换动画
        &.mini-enter-active,
        &.mini-leave-active {
            transition: all 0.4s;
        }
        &.mini-enter,
        &.mini-leave-to {
            opacity: 0;
        }
        .pic {
            flex: 0 0 40px;
            padding-left: 20px;
            img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
            }
        }
        .text {
            flex: 1;
            padding-left: 10px;
            height: 40px;
            .song-name {
                font-size: @font-size-medium;
                margin-bottom: 3px;
            }
            .singer-name {
                font-size: @font-size-small;
                color: @text-color-lighter;
            }
        }
        .control {
            flex: 0 0 30px;
            padding-right: 10px;
            .icon-songlist {
                font-size: @iconfont-size-m;
                color: @theme-yellow;
            }
            .icon-pause {
                font-size: @iconfont-size-m;
                color: @theme-yellow;
            }
        }
    }
}
</style>