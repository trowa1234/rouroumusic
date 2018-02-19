<template>
    <div class="search-box">
        <i class="iconfont icon-search"></i>
        <!-- 使用v-model双向绑定输入框 -->
        <input type="text" class="box" :placeholder="placeholder" v-model="query" />
        <!-- 当输入的框有内容时才显示清空按钮 -->
        <i v-show="query" class="iconfont icon-del" @click="clear"></i>
    </div>
</template>

<script type="text/ecmascript-6">
export default {
    name: "search-box",
    props: {
        //input提示文字
        placeholder: {
            type: String,
            default: "搜索歌曲、歌手"
        }
    },
    data() {
        return {
            query: "" //定义输入的字符，初始为空
        };
    },
    methods: {
        //清除按钮点击
        clear() {
            this.query = ""; //使输入框的值为空
        },
        //设置输入框文字的方法，曝露出去给父组件使用
        setQuery(query){
            this.query = query;
        }
    },
    created() {
        //created时监视query这个数据，发生变化时就把派发自定义事件query出去
        //并把新的query值作为参数传递出去
        this.$watch("query", newQuery => {
            this.$emit("query", newQuery);
        });
    }
};
</script>

<style scoped lang="less">
@import "../../common/less/main.less";
.search-box {
    display: flex;
    height: 40px;
    border-radius: 6px;
    background: @body-bg-blacker;
    align-items: center;
    .box {
        background: @body-bg-blacker;
        flex: 1;
        border: 0;
        color: @text-color-white;
        font-size: @font-size-medium;
        line-height: 18px;
        margin-left: 10px;
        &::placeholder {
            color: @text-color-lighter;
        }
    }
    .icon-search {
        flex: 0 0 20px;
        font-size: @iconfont-size-s;
        color: #000;
        margin-left: 10px;
    }
    .icon-del {
        text-align: center;
        flex: 0 0 30px;
        font-size: 16;
        color: #121212;
    }
}
</style>