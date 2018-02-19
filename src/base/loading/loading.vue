<template>
    <div class="loading">
        <img src="./loading.gif" />
        <p class="text">{{title}}</p>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
    name: "loading",
    props:{
        //从父级接收loading显示的文字，不传就显示默认的
        title:{
            type:String,
            default:'正在载入……'
        }
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.loading{
    width: 100%;
    text-align: center;
    img{width: 30px;height: 30px;}
    .text{
        line-height: 40px;
        font-size: @font-size-small;
        color:#fff;
    }
}
</style>