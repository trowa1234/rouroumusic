<template>
    <!-- 绑定点击事件，实现点击进度条，当前进度跳转 -->
    <div @click="progressClick" class="progress-bar" ref="progressBar">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <!-- 绑定touch事件（3个）。prevent修饰是阻止默认行为 -->
            <div class="progress-btn-wrapper" ref="progressBtn" @touchstart.prevent="progressTouchStart" @touchmove.prevent="progressTouchMove" @touchend="progressTouchEnd">

                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import { prefixStyle } from "@/common/js/dom";

const progressBtnWidth = 16; //进度按钮宽度
const transform = prefixStyle("transform"); //自动添加css合适的前缀

export default {
    name: "progress-bar",
    data() {
        return {
            touch: {} //定义空对象，用来存放这3个事件中需要传递的一些数据方便访问
        };
    },
    props: {
        //接收播放进度
        percent: {
            type: Number,
            default: 0
        }
    },
    methods: {
        //触摸开始
        progressTouchStart(e) {
            //在新建的对象中保存以下信息
            this.touch.initiated = true; //定义初始化为true
            this.touch.startX = e.touches[0].pageX; //记录第一个手指触摸屏幕的x轴坐标
            this.touch.left = this.$refs.progress.clientWidth; //记录当前播放进度条的宽度
        },
        //触摸移动时
        progressTouchMove(e) {
            //如果没有初始化，直接退出
            if (!this.touch.initiated) {
                return;
            }
            //触发开始时的x坐标 - 移动后的x坐标 = 移动的距离
            const deltaX = e.touches[0].pageX - this.touch.startX;
            //获取进度条的总长度 = 元素总长度 - 按钮的长度
            const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
            //获取当前进度位置：计算出拖拽的位置，拖动不能超出整个进度条，所以取最小值在总长度和拖动长度之间。
            //里面的偏移量取最大值，当前进度 + 拖动的距离
            const offsetWidth = Math.min(barWidth,Math.max(0, this.touch.left + deltaX));
            //调用方法设置进度位置
            this._offset(offsetWidth);
        },
        //触摸结束时
        progressTouchEnd() {
            this.touch.initiated = false;   //重置触摸初始化为false
            this._triggerPercent(); //派发当前进度到父级
        },
        //跳转到相应位置进行播放
        progressClick(e){
            //获取x轴偏移量，就是点击的位置e.offsetX。把它设置给当前进度
            //this._offset(e.offsetX);有bug

            //getBoundingClientRect()这个方法可以获取dom元素距离屏幕边的宽度
            const rect = this.$refs.progressBar.getBoundingClientRect();
            //e.pageX是用屏幕边到触摸点的宽度。所以用这个值减去左边的距离就能得到触摸到进度条的宽度
            const offsetWidth = e.pageX - rect.left;
            this._offset(offsetWidth);
            //派发当前进度到父级
            this._triggerPercent();
        },
        //根据当前进度位置计算当前进度百分比，通过自定义事件传给父级
        _triggerPercent(){
            //获取进度条的总长度
            const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
            //获取当前进度百分比：当前进度长度 ÷ 进度总长度
            const percent = this.$refs.progress.clientWidth / barWidth;
            //发送自定事件percentChange给父级
            this.$emit('percentChange',percent);
        },
        //封装设置当前进度位置方法
        _offset(offsetWidth) {
            //设置当前进度dom宽度为计算出来的offsetWidth
            this.$refs.progress.style.width = `${offsetWidth}px`;
            //设置按钮位置
            this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        }
    },
    watch: {
        //监听传入的pencent
        percent(newPercent) {
            //当百分比>=0时 和 没有进行拖动时执行下面的语句。否则拖动的优先级最大，先执行拖动后的事件
            if (newPercent >= 0 && !this.touch.initiated) {
                //获取进度条的总长度
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
                //获取当前进度位置，总长度 × 进度百分比
                const offsetWidth = newPercent * barWidth;
                //调用方法设置进度位置
                this._offset(offsetWidth);
            }
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.progress-bar {
    height: 30px;
    .bar-inner {
        position: relative;
        top: 13px;
        height: 4px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 2px;
        .progress {
            height: 100%;
            background: @theme-yellow;
            border-radius: 2px;
        }
        .progress-btn-wrapper {
            position: absolute;
            left: -8px;
            top: -13px;
            width: 30px;
            height: 30px;
            .progress-btn {
                position: relative;
                top: 7px;
                left: 7px;
                box-sizing: border-box;
                width: 16px;
                height: 16px;
                border: 3px solid @text-color-white;
                border-radius: 50%;
                background: @theme-yellow;
            }
        }
    }
}
</style>