<template>
    <transition name="confirm-fade">
        <div class="confirm" v-show="showFlag" @click.stop>
            <div class="confirm-wrapper">
                <div class="confirm-content">
                    <p class="text">{{text}}</p>
                    <div class="operate">
                        <div @click="cancel" class="operate-btn left">{{cancelBtnText}}</div>
                        <div @click="confirm" class="operate-btn">{{confirmBtnText}}</div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
export default {
    name: "confirm",
    props:{
        //对话框文字，需传入
        text:{
            type:String,
            default:''
        },
        //确定按钮文字，需传入
        confirmBtnText:{
            type:String,
            default:"确定"
        },
        //取消按钮文字，需传入
        cancelBtnText:{
            type:String,
            default:"取消"
        }
    },
    data(){
        return{
            showFlag:false
        }
    },
    methods:{
        show(){
            this.showFlag = true;
        },
        hide(){
            this.showFlag = false;
        },
        //取消按钮点击事件
        cancel(){
            this.hide();
            this.$emit('cancel');
        },
        //确定按钮点击事件
        confirm(){
            this.hide();
            this.$emit('confirm');
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.confirm{
    position: fixed;
    top:0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 998;
    background: rgba(14, 13, 13, 0.5);
    &.confirm-fade-enter-active{
        animation: confirm-fadein 0.3s;
        .confirm-content{
            animation: confirm-zoom 0.3s;
        }
    }
    .confirm-wrapper{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        z-index: 999;
        .confirm-content{
            width: 270px;
            border-radius: 12px;
            background: @body-bg-blacker;
            .text{
                padding: 18px 16px;
                line-height: 22px;
                text-align: center;
                font-size: @font-size-medium-x;
                color: @text-color-lighter;
            }
            .operate{
                display: flex;
                align-items: center;
                text-align: center;
                font-size: @font-size-medium-x;
                .operate-btn{
                    flex: 1;
                    line-height: 22px;
                    padding: 10px 0;
                    border-top: 1px solid @text-color-lighter;
                    color: @text-color-lighter;
                    &.left{
                        border-right: 1px solid @text-color-lighter;
                    }
                }
            }
        }
    }
}
@keyframes confirm-fadein{
    0%{
        opacity: 0;
    }
    100%{
        opacity: 1;
    }
}

@keyframes confirm-zoom {
     0%{
        transform:scale(0);
    }
    50%{
        transform:scale(1.1);
    }
    100%{
        transform:scale(1);
    }
}
</style>