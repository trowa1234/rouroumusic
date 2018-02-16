<template>
    <!-- vuex中的播放列表不为空显示播放器 -->
    <div class="player" v-show="playlist.length>0">
        <!-- 切换到播放器时有动画效果，直接用transition标签，然后在css样式中编写 -->
        <!-- 还需要做cd飞出的效果，这样的效果就只有用动画函数钩子 -->
        <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
            <!--4个函数钩子，绑定这些钩子，在methods中操作它们 -->

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
                            <!-- 绑定cd旋转样式 -->
                            <div class="cd" :class="cdCls">
                                <img :src="currentSong.image" class="image">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <div class="progress-wrapper">
                        <span class="current-time">{{_formatTime(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
                        </div>
                        <span class="total-time">{{_formatTime(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon">
                            <i class="iconfont icon-listloop"></i>
                        </div>
                        <div class="icon">
                            <i @click="prve" class="iconfont icon-prve" :class="disableCls"></i>
                        </div>
                        <div class="icon">
                            <!-- 样式绑定有两个条件的情形，用数组 -->
                            <i @click="togglePlaying" :class="[playIcon, disableCls]" class="iconfont"></i>
                        </div>
                        <div class="icon">
                            <i @click="next" class="iconfont icon-next" :class="disableCls"></i>
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
                    <!-- 绑定cd旋转样式 -->
                    <img :src="currentSong.image" :class="cdCls" />
                </div>
                <div class="text">
                    <h3 class="song-name" v-html="currentSong.name"></h3>
                    <h4 class="singer-name" v-html="currentSong.singer"></h4>
                </div>
                <div class="control">
                    <!-- 小播放器播放暂停按钮，点击事件加了stop修饰是为了防止冒泡 -->
                    <i @click.stop="togglePlaying" class="iconfont" :class="playIcon"></i>
                </div>
                <div class="control">
                    <i class="iconfont icon-songlist"></i>
                </div>
            </div>
        </transition>

        <!-- 发现点击前进后退按钮过快，会发生报错，这是由于歌曲还没有加载完毕造成的 -->
        <!-- 所以绑定两个事件，一个是audio的canplay事件（歌曲是否加载完成），一个是error事件（错误回调） -->
        <!-- 歌曲播放时，audio标签会派发一个事件timeupdate，绑定这个事件 -->
        <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime"></audio>
    </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations } from "vuex"; //使用vuex的getters,mutations
import animations from "create-keyframe-animation"; //在js中使用css3动画，这里就需要一个第三方的插件库create-keyframe-animation
import { prefixStyle } from "@/common/js/dom"; //自动添加浏览器厂商CSS前缀方法
import { formatTime } from "@/common/js/song";  //格式化时间的方法
import ProgressBar from "@/base/progress-bar/progress-bar";

const transform = prefixStyle("transform");

export default {
    name: "player",
    data(){
        return {
            songReady:false, //设置歌曲是否加载完毕标志位，初始为false
            currentTime:0   //定义音乐当前时间
        }
    },
    computed: {
        //播放按钮样式处理，当在播放状态时显示'icon-pause'按钮，当在暂停状态是显示'icon-play'按钮
        playIcon() {
            return this.playing ? "icon-pause" : "icon-play";
        },
        //cd图片样式处理，当在播放状态时添加'play'样式，当在暂停状态是添加'play pause'样式
        cdCls() {
            return this.playing ? "play" : "play pause";
        },
        //当歌曲没有加载完毕时添加一个禁用的样式disable
        disableCls(){
            return this.songReady ? '' : 'disable'
        },
        //计算播放进度：当前播放时长 ÷ 总时长
        percent(){
            return this.currentTime / this.currentSong.duration;
        },
        //计算属性中使用mapGetters
        ...mapGetters(["playlist", "fullScreen", "currentSong", "playing", "currentIndex"])
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
        //改变playing的状态
        togglePlaying() {
            //判断歌曲是否加载完毕
            if(!this.songReady){
                return
            }
            //使用映射过来方法来改变playing这个数据（vuex中state的数组只能由mutations的方法才能修改）
            this.setPlayingState(!this.playing); //对this.playing进行切换取反。(当是播放状态时切换为false，当是暂停是切换为true)
        },
        //切换至上一首歌
        prve(){
            //判断歌曲是否加载完毕
            if(!this.songReady){
                return
            }
            //获取上一首个的索引值:当前索引-1
            let index = this.currentIndex - 1;
            //如果index为-1了，说明索引已经到第一项了
            if(index === -1){
                //就把索引跳转到歌曲列表的最后1位
                index = this.playlist.length - 1
            }
            // 设置此索引值为当前索引值
            this.setCurrentIndex(index);

            //解决当暂停状态时切换到下一首歌，播放状态若然是false的情况
            if(!this.playing){
                this.togglePlaying();
            }

            //把songReady数据还原为false
            this.songReady = false;
        },
        //切换至上一首歌
        next(){
            //判断歌曲是否加载完毕
            if(!this.songReady){
                return
            }
             //获取下一首个的索引值:当前索引+1
            let index = this.currentIndex + 1;
            //如果index为歌曲列表的个数了，说明索引已经到最后一项了
            if(index === this.playlist.length){
                //就把索引跳转到歌曲列表的第1位
                index = 0;
            }
            this.setCurrentIndex(index);

            if(!this.playing){
                this.togglePlaying();
            }

            //把songReady数据还原为false
            this.songReady = false;
        },
        //歌曲加载事件，此事件触发就说明歌曲加载完毕
        ready(){
            //加载完毕就把songReady改变为true
            this.songReady = true;
        },
        //error事件，用于当歌曲路径有问题没有到读取到歌曲数据的时候，这个事件就会发生
        error(){
            // 如果当歌曲路径有问题，那么我们之前定义的songReady就一直为false，那么那些按钮全都不能点击了
            //为了能够跳过这首歌曲，当播放器报错时就把songReady设置为true
            this.songReady = true;
        },
        updateTime(e){
            // e.target.currentTime就是audio当前播放的时间，这个数据可以被读写
            this.currentTime = e.target.currentTime;
        },
        //进度条组件传递出来的事件，参数为拖动后的进度百分比
        onProgressBarChange(percent){
            //audio提供的属性currentTime可读写，就把它修改为总时长 × 百分比
            this.$refs.audio.currentTime = this.currentSong.duration * percent;
            //解决暂停时拖动进度条后为暂停状态，拖动后立即播放
            if(!this.playing){
                this.togglePlaying();
            }
        },


        //动画钩子函数Start
        enter(el, done) {
            const { x, y, scale } = this._getPosAndScale(); //获取目标坐标和缩放
            //使用第三方插件在js中是用css3动画
            let animation = {
                0: {
                    transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
                },
                60: {
                    transform: `translate3d(0,0,0) scale(1.1)`
                },
                100: {
                    transform: `translate3d(0,0,0) scale(1)`
                }
            };
            animations.registerAnimation({
                name: "move",
                animation,
                presets: {
                    duration: 400,
                    easing: "linear"
                }
            });
            animations.runAnimation(this.$refs.cdWrapper, "move", done);
        },
        afterEnter() {
            animations.unregisterAnimation("move");
            this.$refs.cdWrapper.style.animation = "";
        },
        leave(el, done) {
            this.$refs.cdWrapper.style.transition = "all 0.4s";
            const { x, y, scale } = this._getPosAndScale();
            this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
            this.$refs.cdWrapper.addEventListener("transitionend", done);
        },
        afterLeave() {
            this.$refs.cdWrapper.style.transition = "";
            this.$refs.cdWrapper.style[transform] = "";
        },
        //动画钩子函数End


        //获取中间大cd图片到小播放器中的cd图片的位置坐标和缩放比例的方法
        _getPosAndScale() {
            const targetWidth = 40; //小cd图片宽度
            const paddingLeft = 40; //小cd图片左边距，左边到圆心
            const paddingBottom = 30; //小cd图片下边距，下边到圆心

            const paddingTop = 80; //大cd图片距顶部的高度，从边算
            const width = window.innerWidth * 0.8; //大cd图片的宽度,css设置的80%
            const scale = targetWidth / width; //所以可以得到缩放比例为小cd宽度除以大cd宽度
            const x = -(window.innerWidth / 2 - paddingLeft); //小cd图片圆心x轴坐标
            const y = window.innerHeight - paddingTop - width / 2 - paddingBottom; //小cd图片圆心y轴坐标
            return {x, y, scale};
        },
        //格式化时间。在html结构中不能直接使用引入的方法
        _formatTime(time){
            return formatTime(time);
        },
        ...mapMutations({
            setFullScreen: "SET_FULL_SCREEN", //设置fullScreen方法。把mutations中的SET_FULL_SCREEN方法映射给setFullScreen
            setPlayingState: "SET_PLAYING_STATE", //设置playing方法
            setCurrentIndex:"SET_CURRENT_INDEX"//设置currentIndex方法
        })
    },
    watch: {
        //监听当前播放歌曲
        currentSong() {
            //等待dom加载完毕后执行
            this.$nextTick(() => {
                //发生改变时调用audio的play方法
                this.$refs.audio.play();
            });
        },

        //监听播放状态
        playing(newPlaying) {
            const audio = this.$refs.audio;
            this.$nextTick(() => {
                //如果playing为true调用播放方法，为false调用暂停方法
                newPlaying ? audio.play() : audio.pause();
            });
        }
    },
    components:{
        ProgressBar
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
                        //播放时cd360度旋转
                        &.play {
                            animation: rotate 20s linear infinite;
                        }
                        //暂停时，旋转停止
                        &.pause {
                            animation-play-state: paused;
                        }
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
            position: absolute;
            bottom: 50px;
            left: 0;
            width: 100%;
            .progress-wrapper{
                position: absolute;
                width: 100%;
                top:-100%;
                display: flex;
                align-items: center;
                font-size: @font-size-medium;
                .current-time{
                    flex: 0 0 35px;
                    margin-left: 8%;
                    text-align: left;
                }
                .progress-bar-wrapper{
                    flex:1;
                }
                .total-time{
                    flex: 0 0 35px;
                    margin-right: 8%;
                    text-align: right;
                }
            }
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
                    .icon-play,
                    .icon-pause {
                        font-size: 50px;
                    }
                    .iconfont.disable{
                        color: @text-color-lighter;
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
                //播放时cd360度旋转
                &.play {
                    animation: rotate 20s linear infinite;
                }
                //暂停时，旋转停止
                &.pause {
                    animation-play-state: paused;
                }
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
            padding: 0 10px;
            .icon-songlist {
                font-size: @iconfont-size-m;
                color: @theme-yellow;
            }
            .icon-pause,
            .icon-play {
                font-size: @iconfont-size-m;
                color: @theme-yellow;
            }
        }
    }
}
@keyframes rotate {
    0% {
        transform: rotate(0);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>