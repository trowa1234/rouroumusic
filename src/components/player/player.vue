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
                <!-- 绑定触摸事件 -->
                <div class="middle" 
                     @touchstart.prevent="middleTouchStart" 
                     @touchmove.prevent="middleTouchMove" 
                     @touchend="middleTouchEnd">
                    <div class="middle-l" ref="middleL">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <!-- 绑定cd旋转样式 -->
                            <div class="cd" :class="cdCls">
                                <img :src="currentSong.image" class="image">
                            </div>
                        </div>
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyric">{{playingLyric}}</div>
                        </div>
                    </div>
                    <!-- 歌词 使用了scroll组件，使其可以滚动-->
                    <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                        <div class="lyric-wrapper">
                            <div v-if="currentLyric">
                                <p ref="lyricLine" 
                                   class="text" 
                                   v-for="(line,index) in currentLyric.lines" 
                                   :key="index" 
                                   :class="{'current':currentLineNum === index}"><!--当索引值等于当前行数时添加current样式 -->
                                   {{line.txt}}
                                </p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
                        <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
                    </div>
                    <div class="progress-wrapper">
                        <span class="current-time">{{_formatTime(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
                        </div>
                        <span class="total-time">{{_formatTime(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon">
                            <!-- 绑定播放模式样式。添加点击事件切换模式 -->
                            <i class="iconfont" @click="changeMode" :class="iconMode"></i>
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
                            <i class="iconfont icon-favorite" @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
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
                    <progress-circle :radius="radius" :percent="percent">
                        <!-- 小播放器播放暂停按钮，点击事件加了stop修饰是为了防止冒泡 -->
                        <i @click.stop="togglePlaying" class="iconfont" :class="playIcon"></i>
                    </progress-circle>
                </div>
                <!-- 播放列表图标，点击显示播放列表 -->
                <div class="control" @click.stop="showPlaylist">
                    <i class="iconfont icon-songlist"></i>
                </div>
            </div>
        </transition>

        <!-- 歌曲列表组件 -->
        <playlist ref="playlist"></playlist>

        <!-- 发现点击前进后退按钮过快，会发生报错，这是由于歌曲还没有加载完毕造成的 -->
        <!-- 所以绑定两个事件，一个是audio的canplay事件（歌曲是否加载完成），一个是error事件（错误回调） -->
        <!-- 歌曲播放时，audio标签会派发一个事件timeupdate -->
        <!-- 歌曲播放结束时，会派发一个事件ended -->
        <audio class="audio" ref="audio" :src="currentSong.url" 
               @canplay="ready" 
               @error="error" 
               @timeupdate="updateTime" 
               @ended="end">
        </audio>
    </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions} from "vuex"; //使用vuex的getters,mutations,actions
import animations from "create-keyframe-animation"; //在js中使用css3动画，这里就需要一个第三方的插件库create-keyframe-animation
import { prefixStyle } from "@/common/js/dom"; //自动添加浏览器厂商CSS前缀方法
import { formatTime } from "@/common/js/song";  //格式化时间的方法
import ProgressBar from "@/base/progress-bar/progress-bar"; //进度条
import ProgressCircle from "@/base/progress-circle/progress-circle"; //环形进度条
import {playMode} from '@/common/js/config'; //引入播放模式对象
import Lyric from "lyric-parser"; //引入歌词插件
import Scroll from "@/base/scroll/scroll"; //滚动插件
import Playlist from "@/components/playlist/playlist" //歌曲列表组件
import {playerMixin} from "@/common/js/mixin"; //引入播放模式切换公共代码.切换播放模式的代码需要到这里查看

const transform = prefixStyle("transform");
const transitionDuration = prefixStyle('transitionDuration'); //动画时间css

export default {
    mixins:[playerMixin],
    name: "player",
    data(){
        return {
            songReady:false, //设置歌曲是否加载完毕标志位，初始为false
            currentTime:0,   //定义音乐当前时间
            radius:32,   //定义环形播放器宽高
            currentLyric:null,   //存放歌词
            currentLineNum:0,    //歌词当前行数
            currentShow:'cd',    //cd页面和歌词页面切换标志
            touch:{},    //定义空对象，用来存放这触摸事件中需要传递的一些数据方便访问
            playingLyric:'' //cd页当前显示歌词
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
        ...mapGetters([
            "fullScreen", 
            "playing", 
            "currentIndex"
        ])
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

            //当歌曲暂停时，歌词暂停。当歌曲播放时，歌词播放
            if(this.currentLyric){
                this.currentLyric.togglePlay();//插件提供的togglePlay()方法
            }
        },
        //歌曲播放结束事件
        end(){
            //如果是单曲循环模式
            if(this.mode === playMode.loop){
                this.loop();//循环播放
            }else{
                this.next();//下一首
            }
        },
        //单曲循环播放
        loop(){
            //修改audio提供currentTime，使当前播放时间为0
            this.$refs.audio.currentTime = 0;
            this.$refs.audio.play();    //开始播放

            //解决循环播放时，歌曲重头开始，歌词没有跳回最开始的位置
            if(this.currentLyric){
                //使用插件提供的seek()方法跳转到指定的时间，0表示开始
                this.currentLyric.seek(0);
            }
        },
        //切换至上一首歌
        prve(){
            //判断歌曲是否加载完毕
            if(!this.songReady){
                return
            }

            //边界判断：当歌曲列表只有1首歌的情况，直接调用循环播放
            if(this.playlist.length === 1){
                this.loop();
            } else{
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

            //边界判断：当歌曲列表只有1首歌的情况，直接调用循环播放
            if(this.playlist.length === 1){
                this.loop();
            } else{
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
            }
            //把songReady数据还原为false
            this.songReady = false;
        },
        //歌曲加载事件，此事件触发就说明歌曲加载完毕
        ready(){
            //加载完毕就把songReady改变为true
            this.songReady = true;

            //当触发加载事件时调用vuex的actions中映射的方法
            //保存当前的歌曲到播放历史列表中，同是把数据存入本地缓存
            this.savePlayHistory(this.currentSong);
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
            //计算当前播放的时间：总时长 × 百分比
            const currentTime = this.currentSong.duration * percent;
            //audio提供的属性currentTime可读写，就把它修改为当前播放时间
            this.$refs.audio.currentTime = currentTime;
            //解决暂停时拖动进度条后为暂停状态，拖动后立即播放
            if(!this.playing){
                this.togglePlaying();
            }

            //解决拖动进度条时，歌词的位置没有发生改变
            if(this.currentLyric){
                //指定歌词跳转到对应的时间，传入当前播放时间 * 1000毫秒
                this.currentLyric.seek(currentTime * 1000)
            }
        },
        //歌词获取处理
        getLyric(){
            //此方法return出来的是promise对象所以使用.then
            this.currentSong.getLyric().then((lyric) => {
                //使用插件对歌词进行处理并赋值给currentLyric。第1个参数是获取到的歌词，第2个参数当歌词行数发生改变时的执行的回调函数
                this.currentLyric = new Lyric(lyric, this.handleLyric);
                //console.log(this.currentLyric) //处理后的歌词对象

                // 当正在播放歌曲时，
                if(this.playing){
                    //使用插件提供的方法，歌词也开始播放
                    this.currentLyric.play();
                }
            })
        },
        //歌词行数发送改变的回调，会把当前行数和当前文字作为参数传递出来
        handleLyric({lineNum,txt}){
            this.currentLineNum = lineNum;  //把当前行数赋值给currentLineNum
            if(lineNum > 5){
                //滚动的位置是指定在5行之后，也就是规定滚动发生的位置，所以使用了当前行数-5这个方法来获取滚动元素的位置
                let lineEl = this.$refs.lyricLine[lineNum-5];
                this.$refs.lyricList.scrollToElement(lineEl,1000);//调用的scroll曝露出来的方法,使其可以滚动到指定的元素
            }else{
                //如果当前行数小于5，直接向上滚动
                this.$refs.lyricList.scrollTo(0,0,1000)
            }

            //把参数当前文字赋值给当前歌词显示playingLyric
            this.playingLyric = txt;
        },
        //点击显示歌曲列表
        showPlaylist(){
            //调用playlist组件的方法
            this.$refs.playlist.show();
        },

        //触摸事件Start（切换cd图片页和歌词页面）
        middleTouchStart(e){
            this.touch.initiated = true;    //初始化

            // 用来判断是否是一次移动
            this.touch.moved = false;

            //第一个手指
            const touch = e.touches[0];  
            // 保存坐标
            this.touch.startX = touch.pageX;
            this.touch.startY = touch.pageY;
        },
        middleTouchMove(e){
            //是否初始化
            if(!this.touch.initiated){
                return
            }

            const touch = e.touches[0];
            // 获取偏移量
            const deltaX = touch.pageX - this.touch.startX
            const deltaY = touch.pageY - this.touch.startY
            
            //如果y轴偏移量大于x轴，说明是在做上下滚动。直接return
            if(Math.abs(deltaY) > Math.abs(deltaX)){
                return
            }

            if(!this.touch.moved){
                this.touch.moved = true;
            }

            // 当页面在cd图片页时，left取值0。不在cd图片页时取值负的整个屏幕宽度
            const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;

            // 获取偏移的宽度
            const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
            //获取偏移量比分别：偏移的宽度 ÷ 屏幕宽度
            this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
            //设置歌词页滑动
            this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
            this.$refs.lyricList.$el.style[transitionDuration] = 0;

            //设置cd页面渐隐
            this.$refs.middleL.style.opacity = 1 - this.touch.percent;
            this.$refs.middleL.style[transitionDuration] = 0;
        },
        middleTouchEnd(e){
            if(!this.touch.moved){
                return
            }
            
            let offsetWidth;
            let opacity;
            //当在cd页时
            if(this.currentShow === 'cd'){
                //向左滑动大于10%就翻页
                if(this.touch.percent > 0.3){
                    offsetWidth = -window.innerWidth;  //设置偏移值
                    this.currentShow = 'lyric'; //把页面标志设置为lyric
                    opacity = 0;
                } else{
                    offsetWidth = 0; //滑动没有达到10%，则不动
                    opacity = 1;
                }
            }else{//当在cd页时歌词页
                //向右滑动小于90%就翻页
                if(this.touch.percent < 0.7){
                    offsetWidth = 0 //设置偏移值为0。目前的偏移值为-window.innerWidth
                    this.currentShow = 'cd'//把页面标志设置为cd
                    opacity = 1;
                } else{
                    offsetWidth = -window.innerWidth;
                    opacity = 0;
                }
            }
            //设置歌词页滑动
            this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
            const time = 300; //滑动动画时间
            this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;

            //设置cd页面渐隐渐显
            this.$refs.middleL.style.opacity = opacity;
            this.$refs.middleL.style[transitionDuration] = `${time}ms`;

            this.touch.initiated = false;   //初始化设为false
        },
        //触摸事件End

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
            setFullScreen: "SET_FULL_SCREEN" //设置fullScreen方法。把mutations中的SET_FULL_SCREEN方法映射给setFullScreen
        }),
        ...mapActions([
            "savePlayHistory"
        ])
    },
    watch: {
        //监听当前播放歌曲
        currentSong(newSong, oldSong) {
            //解决在删除掉最后1首歌时，会报错。
            //这是因为当删除了最后1首歌曲，newSong这个数据就是undefind，所以会执行下面的语句
            if(!newSong.id){
                return
            }

            //解决暂停时切换播放模式会导致继续播放，设置判断如果两首歌为同一首歌则return
            if(newSong.id === oldSong.id){
                return
            }

            //切换歌曲时停止播放当前歌词
            if(this.currentLyric){
                this.currentLyric.stop();   //插件提供的stop()方法
            }

            /* 
            //等待dom加载完毕后执行
            this.$nextTick(() => {
                //发生改变时调用audio的play方法
                this.$refs.audio.play();
                //播放歌曲发送改变时获取歌词
                this.getLyric();
            }); 
            */

            //为了解决播放器从后台返回前台是可以正常的播放，所以改用延迟1秒执行
            setTimeout(() => {
                this.$refs.audio.play();  //播放歌曲
                this.getLyric();    //获取歌词
            },1000)

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
        ProgressBar,
        ProgressCircle,
        Scroll,
        Playlist
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
                font-size: @font-size-medium-x;
                .text-overflow();
                width: 78%;
                margin: 0 auto;
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
                .playing-lyric-wrapper{
                    width: 100%;
                    margin-top: 60px;
                    .playing-lyric{
                        text-align: center;
                        font-size: @font-size-medium;
                        line-height: 20px;
                    }
                }
            }
            .middle-r{
                display: inline-block;
                vertical-align: top;
                width: 100%;
                height: 100%;
                overflow: hidden;
                .lyric-wrapper{
                    width: 80%;
                    margin: 0 auto;
                    overflow: hidden;
                    text-align: center;
                    .text{
                        line-height: 32px;
                        color: @text-color-lighter;
                        font-size: @font-size-medium;
                        &.current{
                            color: @text-color-white;
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
            .dot-wrapper{
                text-align: center;
                font-size: 0;
                margin-bottom: 20px;
                .dot{
                    display: inline-block;
                    vertical-align: middle;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin: 0 4px;
                    background: @text-color-white;
                    &.active{
                        width: 20px;
                        border-radius: 5px;
                    }
                }
            }
            .progress-wrapper{
                width: 100%;
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
                    .icon-favorite{
                        &.favorited{
                        color: @brand-danger;
                        }
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
            overflow: hidden;
            .song-name {
                font-size: @font-size-medium;
                margin-bottom: 3px;
                .text-overflow();
            }
            .singer-name {
                font-size: @font-size-small;
                color: @text-color-lighter;
                .text-overflow();
            }
        }
        .control {
            flex: 0 0 30px;
            padding: 0 10px;
            height: 32px;
            .icon-songlist {
                font-size: @iconfont-size-m;
                color: @theme-yellow;
            }
            .icon-pause,
            .icon-play {
                color: rgba(255, 204, 50, 0.5);
                position: absolute;
                left: 0;
                top: -1px;
                z-index: 0;
                font-size: 32px;
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