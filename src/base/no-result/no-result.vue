<template>
    <div class="no-result">
        <div class="icon-wrapper">
            <span class="iconfont icon-gantanhao"></span>
        </div>
        <p class="txt">{{text}}</p>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
    name: "no-result",
    props: {
        text: {
            type: String,
            default: ""
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.no-result {
    width: 100%;
    .icon-wrapper {
        margin: 0 auto;
        text-align: center;
        height: 60px;
        .iconfont {
            font-size: 60px;
            color: @brand-danger;
        }
    }
    .txt {
        margin-top: 20px;
        text-align: center;
        font-size: @font-size-medium;
        color: @text-color-lighter;
    }
}
</style>