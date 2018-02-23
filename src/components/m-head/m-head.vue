<template>
    <div class="mhead">
        <i class="tit_ico"></i>
        <h1 class="tit">
            {{tit}}
        </h1>
        <router-link to="/user" class="user" tag="div">
            <i class="iconfont icon-user"></i>
        </router-link>
    </div>
</template>

<script>
export default {
    name: "mhead",
    data() {
        return {
            tit: "RourouMusic"
        };
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.mhead {
    height: 44px;
    width: 100%;
    background-color: @body-bg-yellow;
    text-align: center;
    position: relative;
    .tit {
        line-height: 44px;
        font-size: @font-size-large;
        color: #fff;
        display: inline-block;
        vertical-align: top;
    }
    .tit_ico {
        width: 25px;
        height: 30px;
        .bg-image("logo");
        display: inline-block;
        vertical-align: top;
        background-size: cover;
        margin: 5px 5px 0;
    }
    .user {
        position: absolute;
        right: 10px;
        top: 8px;
        .icon-user {
            font-size: 28px;
            color: #fff;
        }
    }
}
</style>